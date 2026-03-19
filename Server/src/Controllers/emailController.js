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
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #00ff00; text-align: center; text-transform: uppercase;">Room Allotment: Team ${team.team_name || 'Leader'}</h2>
                        <p>Dear ${team.leader_name || 'Participant'},</p>
                        <p>Your accommodation for the offline round of Bharat Tech has been finalized.</p>
                        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p><strong>Details will be verified at the registration desk upon your arrival.</strong></p>
                        </div>
                        <p>If you have any specific queries regarding accommodation, please reach out to the organizing team.</p>
                        <br/>
                        <p>Best Regards,</p>
                        <p><strong>Bharat Tech Organizing Team</strong></p>
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
