const invitationTemplate = ({ inviterName, projectName, acceptUrl, rejectUrl }) => `
<div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e0f2fe; border-radius: 12px;">
    <h2 style="color: #0284c7;">You've Been Invited To Join A Project</h2>
    <p style="color: #334155;"><strong>${inviterName}</strong> invited you to join the project <strong>${projectName}</strong> on DevPro.</p>
    <div style="margin: 24px 0;">
        <a href="${acceptUrl}" style="background:#0ea5e9;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;margin-right:12px;">Accept Invite</a>
        <a href="${rejectUrl}" style="background:#f1f5f9;color:#334155;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">Reject</a>
    </div>
    <p style="color: #94a3b8; font-size: 12px;">This invite expires in 7 days. If you did not expect this, you can ignore this email.</p>
</div>
`

const taskAssignedTemplate = ({ assigneeName, taskTitle, projectName, taskUrl }) => `
<div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e0f2fe; border-radius: 12px;">
    <h2 style="color: #0284c7;">New Task Assigned To You</h2>
    <p style="color: #334155;">Hi ${assigneeName}, you've been assigned a new task in <strong>${projectName}</strong>:</p>
    <p style="background:#f0f9ff;padding:12px 16px;border-radius:8px;font-weight:bold;color:#0369a1;">${taskTitle}</p>
    <a href="${taskUrl}" style="background:#0ea5e9;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">View Task</a>
</div>
`

module.exports = { invitationTemplate, taskAssignedTemplate }
