/**
 * Selection Email Template for Bharat Tech Xperience 3.0
 * Theme: Stranger Things (Red/Black) - Enhanced with Inline Styles for Email Compatibility
 * @param {Object} team - The team object containing team_name and leader_name
 * @returns {string} - The HTML content for the email
 */
const getSelectionEmailHtml = (team) => {
    const teamName = team.team_name || 'Team';
    const leaderName = team.leader_name || 'Participant';
    const confirmationLink = 'https://bharattech-xperience.theuniques.in/payment';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Congratulations! Selected for Bharat Tech Xperience 3.0</title>
    <style>
        /* Fallback styles for clients that support <style> */
        @media only screen and (max-width: 600px) {
            .container {
                width: 100% !important;
                margin: 0 !important;
            }
            .header h1 {
                font-size: 22px !important;
            }
        }
    </style>
</head>
<body style="font-family: Georgia, serif; line-height: 1.6; color: #ffffff; background-color: #000000; margin: 0; padding: 0;">
    <div class="container" style="max-width: 600px; margin: 20px auto; background-color: #050505; border: 2px solid #330000; box-shadow: 0 0 30px rgba(255, 0, 0, 0.3);">
        <div class="header" style="background-color: #000000; padding: 40px 20px; text-align: center; border-bottom: 3px solid #ff0000;">
            <h1 style="margin: 0; font-size: 28px; letter-spacing: 4px; text-transform: uppercase; color: #ff0000; text-shadow: 0 0 10px #ff0000;">BHARAT TECH XPERIENCE 3.0</h1>
        </div>
        <div class="content" style="padding: 40px 30px; background-color: #050505;">
            <div class="greeting" style="font-size: 22px; font-weight: bold; margin-bottom: 20px; color: #ff0000; text-transform: uppercase;">Congratulations, Team ${teamName}!</div>
            <div class="message" style="margin-bottom: 30px; font-size: 16px; color: #eeeeee;">
                <p>Greetings ${leaderName},</p>
                <p>Step into the unknown. We are formalizing your journey into the Upside Down of innovation. Your team has been **officially selected** to emerge from the darkness and compete in the next phase of Bharat Tech Xperience 3.0.</p>
                <p>You have demonstrated skills that defy the ordinary. Prepare yourselves for what comes next.</p>
            </div>
            
            <div class="highlight-box" style="background-color: #0c0000; border: 1px solid #ff0000; padding: 20px; margin: 30px 0;">
                <ul style="list-style: none; padding: 0; margin: 0;">
                    <li style="margin-bottom: 10px; color: #ffffff;"><strong style="color: #ff0000; width: 100px; display: inline-block; text-transform: uppercase; font-size: 13px;">Event:</strong> Xperience 3.0</li>
                    <li style="margin-bottom: 10px; color: #ffffff;"><strong style="color: #ff0000; width: 100px; display: inline-block; text-transform: uppercase; font-size: 13px;">Round:</strong> Offline Finals</li>
                    <li style="margin-bottom: 10px; color: #ffffff;"><strong style="color: #ff0000; width: 100px; display: inline-block; text-transform: uppercase; font-size: 13px;">Venue:</strong> Campus Grounds</li>
                    <li style="margin-bottom: 10px; color: #ffffff;"><strong style="color: #ff0000; width: 100px; display: inline-block; text-transform: uppercase; font-size: 13px;">Status:</strong> Awaiting Confirmation</li>
                </ul>
            </div>

            <p style="text-align: center; color: #888; font-size: 14px; font-style: italic; margin-bottom: 20px;">Confirm your entry before the gate closes:</p>
            
            <div class="cta-container" style="text-align: center; margin: 40px 0;">
                <a href="${confirmationLink}" class="btn" style="background-color: #000000; color: #ff0000 !important; padding: 15px 35px; text-decoration: none; border: 2px solid #ff0000; font-weight: bold; font-size: 18px; display: inline-block; text-transform: uppercase; letter-spacing: 2px;">Confirm Participation</a>
            </div>

            <div class="message" style="margin-top: 30px; font-size: 14px; color: #aaaaaa; border-top: 1px solid #220000; padding-top: 20px;">
                <p>Keep your senses sharp. Detailed coordinates and protocols will be transmitted to you shortly. Do not ignore the signals.</p>
            </div>
        </div>
    </div>
</body>
</html>
    `;
};

export default getSelectionEmailHtml;
