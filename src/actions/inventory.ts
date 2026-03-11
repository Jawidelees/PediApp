'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { withTenant, requireRole } from '@/lib/with-tenant';

/**
 * Procesa el consumo de inventario con fraccionamiento.
 * TENANT-SCOPED + RBAC.
 */
export async function consumeInventoryUnits(
  appointmentId: string,
  items: Array<{ id: string; quantity: number }>
) {
  const { db, user, clinicId } = await withTenant();
  requireRole(user.role, ['ADMIN', 'DOCTOR']);

  try {
    const result = await db.$transaction(async (tx: any) => {
      const usageRecords = [];

      for (const item of items) {
        const inventoryItem = await tx.inventoryItem.findUnique({ where: { id: item.id } });
        if (!inventoryItem) throw new Error(`Artículo de inventario no encontrado: ${item.id}`);

        let { openPackageUnits, stock, unitsPerPackage, name } = inventoryItem as any;
        let requestedQuantity = item.quantity;
        let updatedOpenUnits = openPackageUnits;
        let updatedStock = stock;

        if (updatedOpenUnits >= requestedQuantity) {
          updatedOpenUnits -= requestedQuantity;
        } else {
          while (requestedQuantity > updatedOpenUnits) {
            if (updatedStock <= 0) throw new Error(`Stock insuficiente para ${name}.`);
            updatedStock -= 1;
            updatedOpenUnits += unitsPerPackage;
          }
          updatedOpenUnits -= requestedQuantity;
        }

        await tx.inventoryItem.update({
          where: { id: item.id },
          data: { stock: updatedStock, openPackageUnits: updatedOpenUnits }
        });

        const usage = await tx.inventoryUsage.create({
          data: {
            appointmentId,
            inventoryId: item.id,
            clinicId: clinicId!,
            quantity: item.quantity,
          },
        });

        usageRecords.push(usage);
      }

      return usageRecords;
    });

    revalidatePath('/dashboard/inventory');
    revalidateTag('inventory');
    return { success: true, count: result.length };
  } catch (error: any) {
    console.error('Error consumiendo inventario:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtiene el inventario completo.
 * TENANT-SCOPED.
 */
export async function getInventory() {
  const { db } = await withTenant();

  try {
    const items = await db.inventoryItem.findMany({ orderBy: { name: 'asc' } });
    return items.map(item => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      costPrice: Number(item.costPrice)
    }));
  } catch (error) {
    console.error('Error obteniendo inventario:', error);
    return [];
  }
}

/**
 * Crea un nuevo artículo de inventario.
 * TENANT-SCOPED + RBAC.
 */
export async function createInventoryItem(data: {
  name: string;
  sku?: string;
  description?: string;
  unitsPerPackage: number;
  unitName: string;
  baseUnitName: string;
  minStock: number;
  unitPrice: number;
  costPrice: number;
  initialStock: number;
}) {
  const { db, user, clinicId } = await withTenant();
  requireRole(user.role, ['ADMIN', 'DOCTOR']);

  try {
    const existing = await db.inventoryItem.findFirst({
      where: {
        OR: [
          { sku: data.sku || undefined },
          { name: { equals: data.name, mode: 'insensitive' } }
        ]
      }
    });

    if (existing) {
      return { success: false, error: 'Ya existe un artículo con este nombre o SKU en esta clínica.' };
    }

    const item = await db.inventoryItem.create({
      data: {
        name: data.name,
        sku: data.sku,
        description: data.description,
        unitsPerPackage: data.unitsPerPackage,
        unitName: data.unitName,
        baseUnitName: data.baseUnitName,
        minStock: data.minStock,
        unitPrice: data.unitPrice,
        costPrice: data.costPrice,
        stock: data.initialStock,
        openPackageUnits: 0,
        clinicId: clinicId!,
      }
    });

    revalidatePath('/dashboard/inventory');
    revalidateTag(`clinic-${clinicId}-inventory`);
    return { success: true, item };
  } catch (error: any) {
    console.error('Error creando artículo:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Actualiza un artículo existente.
 * TENANT-SCOPED + RBAC.
 */
export async function updateInventoryItem(id: string, data: {
  name: string;
  sku?: string;
  description?: string;
  unitsPerPackage: number;
  unitName: string;
  baseUnitName: string;
  minStock: number;
  unitPrice: number;
  costPrice: number;
}) {
  const { db, user, clinicId } = await withTenant();
  requireRole(user.role, ['ADMIN', 'DOCTOR']);

  try {
    const item = await db.inventoryItem.update({
      where: { id },
      data: {
        name: data.name,
        sku: data.sku,
        description: data.description,
        unitsPerPackage: data.unitsPerPackage,
        unitName: data.unitName,
        baseUnitName: data.baseUnitName,
        minStock: data.minStock,
        unitPrice: data.unitPrice,
        costPrice: data.costPrice,
      }
    });

    revalidatePath('/dashboard/inventory');
    revalidateTag(`clinic-${clinicId}-inventory`);
    return { success: true, item };
  } catch (error: any) {
    console.error('Error actualizando artículo:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Soft-delete de artículo de inventario.
 * TENANT-SCOPED + RBAC.
 */
export async function deleteInventoryItem(id: string) {
  const { db, user, clinicId } = await withTenant();
  requireRole(user.role, ['ADMIN']);

  try {
    const usageCount = await db.inventoryUsage.count({ where: { inventoryId: id } });

    if (usageCount > 0) {
      return { success: false, error: 'No se puede eliminar el artículo porque tiene historial de uso.' };
    }

    // Soft delete via tenant middleware
    await db.inventoryItem.delete({ where: { id } });

    revalidatePath('/dashboard/inventory');
    revalidateTag(`clinic-${clinicId}-inventory`);
    return { success: true };
  } catch (error: any) {
    console.error('Error eliminando artículo:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Añade stock a un artículo.
 * TENANT-SCOPED + RBAC.
 */
export async function addInventoryStock(id: string, amountToAdd: number) {
  const { db, user, clinicId } = await withTenant();
  requireRole(user.role, ['ADMIN', 'DOCTOR']);

  try {
    const item = await db.inventoryItem.update({
      where: { id },
      data: { stock: { increment: amountToAdd } }
    });

    revalidatePath('/dashboard/inventory');
    revalidateTag(`clinic-${clinicId}-inventory`);
    return { success: true, item };
  } catch (error: any) {
    console.error('Error añadiendo stock:', error);
    return { success: false, error: error.message };
  }
}
