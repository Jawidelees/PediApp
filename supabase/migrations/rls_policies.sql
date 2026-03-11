-- =============================================================
-- Row Level Security (RLS) Policies for Clínica Pediátrica SaaS
-- =============================================================
-- Ejecutar este script en Supabase SQL Editor
-- Prerequisito: La función set_tenant_context() debe existir (ver set_tenant_context.sql)

-- ============================
-- FUNCIÓN: Establecer contexto del tenant
-- ============================

CREATE OR REPLACE FUNCTION set_tenant_context(p_clinic_id TEXT)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_clinic_id', p_clinic_id, true); -- true = local to transaction
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================
-- FUNCIÓN: Obtener el clinic_id actual del contexto
-- ============================

CREATE OR REPLACE FUNCTION get_current_clinic_id()
RETURNS TEXT AS $$
BEGIN
  RETURN current_setting('app.current_clinic_id', true);
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================
-- FUNCIÓN: Trigger para inyectar clinic_id automáticamente en INSERT
-- ============================

CREATE OR REPLACE FUNCTION enforce_tenant_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Si no viene clinic_id, usar el del contexto
  IF NEW."clinicId" IS NULL THEN
    NEW."clinicId" := get_current_clinic_id();
  END IF;
  
  -- Validar que el clinic_id del INSERT coincida con el contexto
  IF NEW."clinicId" IS DISTINCT FROM get_current_clinic_id() AND get_current_clinic_id() IS NOT NULL THEN
    RAISE EXCEPTION 'Tenant violation: cannot insert data for another clinic (expected %, got %)', 
      get_current_clinic_id(), NEW."clinicId";
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================
-- FUNCIÓN: Prevenir hard deletes en modelos con soft delete
-- ============================

CREATE OR REPLACE FUNCTION prevent_hard_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Hard deletes no están permitidos en esta tabla. Use soft delete (UPDATE deletedAt).';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;


-- ============================
-- RLS POLICIES POR TABLA
-- ============================

-- ----- User -----
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_user_select" ON "User"
  FOR SELECT USING (
    "clinicId" = get_current_clinic_id()
    OR get_current_clinic_id() IS NULL -- SUPER_ADMIN bypass
  );

CREATE POLICY "tenant_isolation_user_insert" ON "User"
  FOR INSERT WITH CHECK (
    "clinicId" = get_current_clinic_id()
    OR get_current_clinic_id() IS NULL
  );

CREATE POLICY "tenant_isolation_user_update" ON "User"
  FOR UPDATE USING (
    "clinicId" = get_current_clinic_id()
    OR get_current_clinic_id() IS NULL
  );

CREATE POLICY "tenant_isolation_user_delete" ON "User"
  FOR DELETE USING (
    "clinicId" = get_current_clinic_id()
    OR get_current_clinic_id() IS NULL
  );


-- ----- PatientProfile -----
ALTER TABLE "PatientProfile" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_patient_select" ON "PatientProfile"
  FOR SELECT USING ("clinicId" = get_current_clinic_id() OR get_current_clinic_id() IS NULL);
CREATE POLICY "tenant_isolation_patient_insert" ON "PatientProfile"
  FOR INSERT WITH CHECK ("clinicId" = get_current_clinic_id() OR get_current_clinic_id() IS NULL);
CREATE POLICY "tenant_isolation_patient_update" ON "PatientProfile"
  FOR UPDATE USING ("clinicId" = get_current_clinic_id() OR get_current_clinic_id() IS NULL);
CREATE POLICY "tenant_isolation_patient_delete" ON "PatientProfile"
  FOR DELETE USING ("clinicId" = get_current_clinic_id() OR get_current_clinic_id() IS NULL);


-- ----- DoctorProfile -----
ALTER TABLE "DoctorProfile" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_doctor_select" ON "DoctorProfile"
  FOR SELECT USING ("clinicId" = get_current_clinic_id() OR get_current_clinic_id() IS NULL);
CREATE POLICY "tenant_isolation_doctor_insert" ON "DoctorProfile"
  FOR INSERT WITH CHECK ("clinicId" = get_current_clinic_id() OR get_current_clinic_id() IS NULL);
CREATE POLICY "tenant_isolation_doctor_update" ON "DoctorProfile"
  FOR UPDATE USING ("clinicId" = get_current_clinic_id() OR get_current_clinic_id() IS NULL);
CREATE POLICY "tenant_isolation_doctor_delete" ON "DoctorProfile"
  FOR DELETE USING ("clinicId" = get_current_clinic_id() OR get_current_clinic_id() IS NULL);


-- ----- Service -----
ALTER TABLE "Service" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_service_select" ON "Service"
  FOR SELECT USING ("clinicId" = get_current_clinic_id() OR get_current_clinic_id() IS NULL);
CREATE POLICY "tenant_isolation_service_insert" ON "Service"
  FOR INSERT WITH CHECK ("clinicId" = get_current_clinic_id() OR get_current_clinic_id() IS NULL);
CREATE POLICY "tenant_isolation_service_update" ON "Service"
  FOR UPDATE USING ("clinicId" = get_current_clinic_id() OR get_current_clinic_id() IS NULL);
CREATE POLICY "tenant_isolation_service_delete" ON "Service"
  FOR DELETE USING ("clinicId" = get_current_clinic_id() OR get_current_clinic_id() IS NULL);


-- ----- Appointment -----
ALTER TABLE "Appointment" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_appointment_select" ON "Appointment"
  FOR SELECT USING ("clinicId" = get_current_clinic_id() OR get_current_clinic_id() IS NULL);
CREATE POLICY "tenant_isolation_appointment_insert" ON "Appointment"
  FOR INSERT WITH CHECK ("clinicId" = get_current_clinic_id() OR get_current_clinic_id() IS NULL);
CREATE POLICY "tenant_isolation_appointment_update" ON "Appointment"
  FOR UPDATE USING ("clinicId" = get_current_clinic_id() OR get_current_clinic_id() IS NULL);
CREATE POLICY "tenant_isolation_appointment_delete" ON "Appointment"
  FOR DELETE USING ("clinicId" = get_current_clinic_id() OR get_current_clinic_id() IS NULL);


-- ----- MedicalRecord -----
ALTER TABLE "MedicalRecord" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_medical_select" ON "MedicalRecord"
  FOR SELECT USING ("clinicId" = get_current_clinic_id() OR get_current_clinic_id() IS NULL);
CREATE POLICY "tenant_isolation_medical_insert" ON "MedicalRecord"
  FOR INSERT WITH CHECK ("clinicId" = get_current_clinic_id() OR get_current_clinic_id() IS NULL);
CREATE POLICY "tenant_isolation_medical_update" ON "MedicalRecord"
  FOR UPDATE USING ("clinicId" = get_current_clinic_id() OR get_current_clinic_id() IS NULL);
CREATE POLICY "tenant_isolation_medical_delete" ON "MedicalRecord"
  FOR DELETE USING ("clinicId" = get_current_clinic_id() OR get_current_clinic_id() IS NULL);


-- ----- Invoice -----
ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_invoice_select" ON "Invoice"
  FOR SELECT USING ("clinicId" = get_current_clinic_id() OR get_current_clinic_id() IS NULL);
CREATE POLICY "tenant_isolation_invoice_insert" ON "Invoice"
  FOR INSERT WITH CHECK ("clinicId" = get_current_clinic_id() OR get_current_clinic_id() IS NULL);
CREATE POLICY "tenant_isolation_invoice_update" ON "Invoice"
  FOR UPDATE USING ("clinicId" = get_current_clinic_id() OR get_current_clinic_id() IS NULL);
CREATE POLICY "tenant_isolation_invoice_delete" ON "Invoice"
  FOR DELETE USING ("clinicId" = get_current_clinic_id() OR get_current_clinic_id() IS NULL);


-- ----- InventoryItem -----
ALTER TABLE "InventoryItem" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_inventory_select" ON "InventoryItem"
  FOR SELECT USING ("clinicId" = get_current_clinic_id() OR get_current_clinic_id() IS NULL);
CREATE POLICY "tenant_isolation_inventory_insert" ON "InventoryItem"
  FOR INSERT WITH CHECK ("clinicId" = get_current_clinic_id() OR get_current_clinic_id() IS NULL);
CREATE POLICY "tenant_isolation_inventory_update" ON "InventoryItem"
  FOR UPDATE USING ("clinicId" = get_current_clinic_id() OR get_current_clinic_id() IS NULL);
CREATE POLICY "tenant_isolation_inventory_delete" ON "InventoryItem"
  FOR DELETE USING ("clinicId" = get_current_clinic_id() OR get_current_clinic_id() IS NULL);


-- ----- GrowthRecord -----
ALTER TABLE "GrowthRecord" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_growth_select" ON "GrowthRecord"
  FOR SELECT USING ("clinicId" = get_current_clinic_id() OR get_current_clinic_id() IS NULL);
CREATE POLICY "tenant_isolation_growth_insert" ON "GrowthRecord"
  FOR INSERT WITH CHECK ("clinicId" = get_current_clinic_id() OR get_current_clinic_id() IS NULL);
CREATE POLICY "tenant_isolation_growth_update" ON "GrowthRecord"
  FOR UPDATE USING ("clinicId" = get_current_clinic_id() OR get_current_clinic_id() IS NULL);
CREATE POLICY "tenant_isolation_growth_delete" ON "GrowthRecord"
  FOR DELETE USING ("clinicId" = get_current_clinic_id() OR get_current_clinic_id() IS NULL);


-- ----- VaccinationRecord -----
ALTER TABLE "VaccinationRecord" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_vaccine_select" ON "VaccinationRecord"
  FOR SELECT USING ("clinicId" = get_current_clinic_id() OR get_current_clinic_id() IS NULL);
CREATE POLICY "tenant_isolation_vaccine_insert" ON "VaccinationRecord"
  FOR INSERT WITH CHECK ("clinicId" = get_current_clinic_id() OR get_current_clinic_id() IS NULL);
CREATE POLICY "tenant_isolation_vaccine_update" ON "VaccinationRecord"
  FOR UPDATE USING ("clinicId" = get_current_clinic_id() OR get_current_clinic_id() IS NULL);
CREATE POLICY "tenant_isolation_vaccine_delete" ON "VaccinationRecord"
  FOR DELETE USING ("clinicId" = get_current_clinic_id() OR get_current_clinic_id() IS NULL);


-- ----- TreatmentPlan -----
ALTER TABLE "TreatmentPlan" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_treatment_select" ON "TreatmentPlan"
  FOR SELECT USING ("clinicId" = get_current_clinic_id() OR get_current_clinic_id() IS NULL);
CREATE POLICY "tenant_isolation_treatment_insert" ON "TreatmentPlan"
  FOR INSERT WITH CHECK ("clinicId" = get_current_clinic_id() OR get_current_clinic_id() IS NULL);
CREATE POLICY "tenant_isolation_treatment_update" ON "TreatmentPlan"
  FOR UPDATE USING ("clinicId" = get_current_clinic_id() OR get_current_clinic_id() IS NULL);
CREATE POLICY "tenant_isolation_treatment_delete" ON "TreatmentPlan"
  FOR DELETE USING ("clinicId" = get_current_clinic_id() OR get_current_clinic_id() IS NULL);


-- ----- SecurityAuditLog -----
ALTER TABLE "SecurityAuditLog" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_audit_select" ON "SecurityAuditLog"
  FOR SELECT USING ("clinicId" = get_current_clinic_id() OR get_current_clinic_id() IS NULL);
CREATE POLICY "tenant_isolation_audit_insert" ON "SecurityAuditLog"
  FOR INSERT WITH CHECK (true); -- Audit logs siempre se pueden insertar


-- ============================
-- SOFT DELETE PROTECTION TRIGGERS
-- Previene hard deletes accidentales en tablas críticas médicas
-- ============================

CREATE OR REPLACE TRIGGER prevent_hard_delete_medical_records
  BEFORE DELETE ON "MedicalRecord"
  FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete();

CREATE OR REPLACE TRIGGER prevent_hard_delete_patient_profiles
  BEFORE DELETE ON "PatientProfile"
  FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete();

CREATE OR REPLACE TRIGGER prevent_hard_delete_vaccination_records
  BEFORE DELETE ON "VaccinationRecord"
  FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete();

CREATE OR REPLACE TRIGGER prevent_hard_delete_growth_records
  BEFORE DELETE ON "GrowthRecord"
  FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete();

CREATE OR REPLACE TRIGGER prevent_hard_delete_treatment_plans
  BEFORE DELETE ON "TreatmentPlan"
  FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete();


-- ============================
-- AUDIT TRIGGER: Log automático para INSERT/UPDATE/DELETE en tablas médicas
-- ============================

CREATE OR REPLACE FUNCTION audit_medical_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO "SecurityAuditLog" (id, "userId", "clinicId", action, resource, "resourceId", metadata, "createdAt")
    VALUES (
      gen_random_uuid()::text,
      COALESCE(current_setting('app.current_user_id', true), 'SYSTEM'),
      NEW."clinicId",
      'DB_TRIGGER_' || TG_OP,
      TG_TABLE_NAME,
      NEW.id,
      jsonb_build_object('operation', TG_OP),
      NOW()
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO "SecurityAuditLog" (id, "userId", "clinicId", action, resource, "resourceId", metadata, "createdAt")
    VALUES (
      gen_random_uuid()::text,
      COALESCE(current_setting('app.current_user_id', true), 'SYSTEM'),
      NEW."clinicId",
      'DB_TRIGGER_' || TG_OP,
      TG_TABLE_NAME,
      NEW.id,
      jsonb_build_object('operation', TG_OP),
      NOW()
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Audit triggers para tablas médicas críticas
CREATE OR REPLACE TRIGGER audit_medical_records_changes
  AFTER INSERT OR UPDATE ON "MedicalRecord"
  FOR EACH ROW EXECUTE FUNCTION audit_medical_changes();

CREATE OR REPLACE TRIGGER audit_patient_profiles_changes
  AFTER INSERT OR UPDATE ON "PatientProfile"
  FOR EACH ROW EXECUTE FUNCTION audit_medical_changes();

CREATE OR REPLACE TRIGGER audit_vaccination_records_changes
  AFTER INSERT OR UPDATE ON "VaccinationRecord"
  FOR EACH ROW EXECUTE FUNCTION audit_medical_changes();
