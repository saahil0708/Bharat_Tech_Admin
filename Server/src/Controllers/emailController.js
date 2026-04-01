import nodemailerConfig from 'nodemailer';
import getSelectionEmailHtml from '../Templates/selectionEmail.js';

const transporter = nodemailerConfig.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});

const sendSelectionEmail = async (req, res) => {
    try {
        const { team } = req.body;
        if (!team) {
            return res.status(400).json({ error: 'Team data missing' });
        }

        const toEmail = team.leader_email || team.email;
        if (!toEmail) {
            console.warn(`Team ${team.team_name} has no email address. Skipping email.`);
            return res.status(200).json({ message: 'No email address found, skipped' });
        }

        const mailOptions = {
            from: process.env.EMAIL_USER || '"Bharat Tech Admin" <admin@bharattech.edu>',
            to: toEmail,
            subject: 'Congratulations! Your team has been selected for Bharat Tech',
            html: getSelectionEmailHtml(team)
        };

        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            const info = await transporter.sendMail(mailOptions);
            console.log('Selection Email sent: %s', info.messageId);
        } else {
            console.log(`[Mock Email] Selected ${team.team_name}. Sent mock email to ${toEmail}`);
        }

        res.status(200).json({ message: 'Email processed successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to process email' });
    }
};

const sendBulkEmail = async (req, res) => {
    try {
        const { team, emailType } = req.body;
        if (!team || !emailType) {
            return res.status(400).json({ error: 'Team data or email type missing' });
        }

        const toEmail = team.leader_email || team.email;
        if (!toEmail) {
            console.warn(`Team ${team.team_name} has no email address. Skipping email.`);
            return res.status(200).json({ message: 'No email address found, skipped' });
        }

        let subject, htmlContent;

        switch (emailType) {
            case 'selection':
                subject = 'Congratulations! Your team has been selected for Bharat Tech';
                htmlContent = getSelectionEmailHtml(team);
                break;
            case 'invitation':
                subject = 'Bharat Tech - Official Invitation Document';
                htmlContent = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #00ccff; text-align: center; text-transform: uppercase;">Official Invitation: Team ${team.team_name || 'Leader'}</h2>
                        <p>Dear ${team.leader_name || 'Participant'},</p>
                        <p>Please find attached or linked your official invitation document for Bharat Tech.</p>
                        <p>This document is required for your entry to the campus. Please keep it handy.</p>
                        <br/>
                        <p>Best Regards,</p>
                        <p><strong>Bharat Tech Organizing Team</strong></p>
                    </div>
                `;
                break;
            case 'room_allotment':
                subject = 'Bharat Tech - Room Allotment Details';
                htmlContent = `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
                        <h2 style="color: #ff0000; text-align: center; text-transform: uppercase; font-size: 24px; margin-bottom: 20px;">Room Allotment: ${team.team_name || 'Your Team'}</h2>
                        <p>Dear <strong>${team.leader_name || 'Leader'}</strong>,</p>
                        <p>Your team's attendance for the offline round of Bharat Tech has been marked successfully.</p>
                        <p>Your designated working space for the event is as follows:</p>
                        
                        <div style="background-color: #f8f9fa; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #ff0000;">
                            <p style="margin: 0; font-size: 16px; color: #333;"><strong>ROOM NUMBER / SPACE:</strong></p>
                            <p style="margin: 10px 0 0 0; font-size: 32px; color: #ff0000; font-weight: bold;">${team.room_no || 'TBD'}</p>
                        </div>

                        <p>Please proceed to your allotted room to set up your workspace. Our volunteers will be available at each block to assist you.</p>
                        <p style="color: #666; font-size: 0.9em;">If you have any specific queries regarding accommodation or workspace, please reach out to the registration desk.</p>
                        <br/>
                        <p style="margin-bottom: 5px;">Best Regards,</p>
                        <p style="margin-top: 0;"><strong>Bharat Tech Organizing Team</strong></p>
                    </div>
                `;
                break;
            default:
                return res.status(400).json({ error: 'Invalid email type' });
        }

        const mailOptions = {
            from: process.env.EMAIL_USER || '"Bharat Tech Admin" <admin@bharattech.edu>',
            to: toEmail,
            subject: subject,
            html: htmlContent
        };

        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            const info = await transporter.sendMail(mailOptions);
            console.log(`Bulk Email (${emailType}) sent: %s`, info.messageId);
        } else {
            console.log(`[Mock Email - ${emailType}] Selected ${team.team_name}. Sent mock email to ${toEmail}`);
        }

        res.status(200).json({ message: 'Email processed successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to process email' });
    }
};

export { sendSelectionEmail, sendBulkEmail };
