const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const taskTypes = [
    "Accounts Payable", "MIS", "Inventory", "Banking & Treasury", 
    "Customer Reconciliations", "Vendor Reconciliation", "Reporting", 
    "Financial Audit", "Tax Audit", "Other Audits", "Assesments & Notices", 
    "Month Closure", "Corporate Taxation", "GST", "Employee Laws", 
    "Due Diligence", "Presentations & Trainings", "Other Reconciallitions", 
    "MCA Filings", "Miscellaneous Activities", "Month End Billing", 
    "Credit Cards & Debt", "Customizations / Automations"
  ].join(',');

  const departments = [
    "SW - Engineering", "Manufacturing and Supply Chain", 
    "Field Operations Technicians", "HW - Engineering", "Operations", 
    "CSM & Sales", "Finance", "HR and Admin", "External People"
  ].join(',');

  const requestTypes = [
    "Accounts Receivable", "Accounts Payable", "General & Administration", "Payroll"
  ].join(',');

  const requestStatuses = [
    "Under Process", "Pending for Review", "Processed"
  ].join(',');

  const settings = await prisma.systemSettings.findFirst();

  if (settings) {
    await prisma.systemSettings.update({
      where: { id: settings.id },
      data: {
        masterTaskTypes: taskTypes,
        masterDepartments: departments,
        masterRequestTypes: requestTypes,
        masterRequestStatuses: requestStatuses,
        moduleAccessMatrix: JSON.stringify({
          'Tasks': ['Finance'],
          'Requests': ['Finance', 'HR and Admin', 'Operations', 'SW - Engineering', 'Manufacturing and Supply Chain', 'Field Operations Technicians', 'HW - Engineering', 'CSM & Sales', 'External People'],
          'Learning': ['Finance']
        }),
        allocationMatrix: JSON.stringify({})
      }
    });
    console.log("Master data updated successfully in database.");
  } else {
    await prisma.systemSettings.create({
      data: {
        id: 'singleton',
        reminderFrequency: 'DAILY',
        reminderTimes: '09:00,18:00',
        managerReportFrequency: 'DAILY',
        managerReportTimes: '10:00',
        loReportFrequency: 'WEEKLY',
        loReportTimes: '10:00',
        masterTaskTypes: taskTypes,
        masterDepartments: departments,
        masterRequestTypes: requestTypes,
        masterRequestStatuses: requestStatuses,
        masterCommunicationModes: "Email,Verbal Discussion,Hangouts,Whatsapp-IC Group",
        masterEntities: 'Intellicar-BLR,Intellicar-MUM,Intellicar-DEL',
        moduleAccessMatrix: JSON.stringify({
          'Tasks': ['Finance'],
          'Requests': ['Finance', 'HR and Admin', 'Operations', 'SW - Engineering', 'Manufacturing and Supply Chain', 'Field Operations Technicians', 'HW - Engineering', 'CSM & Sales', 'External People'],
          'Learning': ['Finance']
        }),
        allocationMatrix: JSON.stringify({})
      }
    });
    console.log("System settings created with new master data.");
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
