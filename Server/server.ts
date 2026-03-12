import express, { Request, Response } from 'express';
import cors from 'cors';
import { supabase } from './src/db';
import { transporter } from './src/mailer';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Replace variables in template
function replaceVariables(template: string, team: any) {
  return template
    .replace(/{{team_name}}/g, team.team_name || "")
    .replace(/{{team_id}}/g, team.id || team.team_id || "")
    .replace(/{{leader_name}}/g, team.leader_name || "")
    .replace(/{{email}}/g, team.email || "");
}

// Health check
app.get('/', (req: Request, res: Response) => {
  res.send('Bulk Email Server is running!');
});

// Send emails to all teams
app.post("/send-mails", async (req: Request, res: Response) => {
  try {
    const { subject, body } = req.body;

    if (!subject || !body) {
      return res.status(400).json({ error: "Subject and body are required." });
    }

    // Fetch all teams from 'teams' table
    const { data: teams, error } = await supabase
      .from("teams")
      .select("*");

    if (error) throw error;
    if (!teams || teams.length === 0) {
      return res.json({ success: true, sent: 0, message: "No teams found to email." });
    }

    let sent = 0;
    const batchSize = 10;

    for (let i = 0; i < teams.length; i += batchSize) {
      const batch = teams.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (team) => {
          const recipientEmail = team.leader_email || team.email;
          if (!recipientEmail) return;

          const html = replaceVariables(body, team);

          await transporter.sendMail({
            from: `"Bharat Tech Xperience" <${process.env.EMAIL_USER}>`,
            to: recipientEmail,
            subject: subject,
            html: html,
          });

          sent++;
        })
      );
      
      // Optional: Add a small delay between batches to avoid hitting rate limits too fast
      if (i + batchSize < teams.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    res.json({ success: true, sent });

  } catch (err: any) {
    console.error("Error sending emails:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
