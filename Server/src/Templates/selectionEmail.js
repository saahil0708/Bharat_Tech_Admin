/**
 * Selection Email Template for Bharat Tech Xperience 3.0
 * Theme: Stranger Things (Red/Black) - Enhanced with Inline Styles for Email Compatibility
 * @param {Object} team - The team object containing team_name and leader_name
 * @returns {string} - The HTML content for the email
 */
const getSelectionEmailHtml = (team) => {
    const teamName = team.team_name || 'Team';
    const leaderName = team.leader_name || 'Participant';
    const leaderEmail = team.leader_email || team.email || 'your-email@example.com';
    const leaderPhone = team.leader_phone || '9876543210';
    const teamCode = team.team_code || 'SECRET-CODE';
    const confirmationLink = 'https://bharattech-xperience.theuniques.in/payment';
    const whatsappLink = 'https://chat.whatsapp.com/EDbu0aetzbaGFsED4p28W8?mode=gi_t';
    const portalUrl = 'btxportal.theuniques.in';

    // Password generation logic: leadername-last5digits (lowercase, no spaces)
    const cleanName = leaderName.replace(/\s+/g, '').toLowerCase();
    const last5Digits = leaderPhone.slice(-5);
    const teamPassword = `${cleanName}-${last5Digits}`;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Congratulations! Selected for Bharat Tech Xperience 3.0</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #ffffff; background-color: #000000; margin: 0; padding: 0;">
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
            
            <!-- WhatsApp Group Link -->
            <div style="background-color: #0c1a0c; border: 1px solid #25d366; padding: 20px; margin-bottom: 25px; border-radius: 5px;">
                <h3 style="color: #25d366; margin-top: 0; text-transform: uppercase; font-size: 16px;">Step 1: Join the Inner Circle</h3>
                <p style="color: #ffffff; margin-bottom: 15px;">Connect with other participants and stay updated with live signals.</p>
                <a href="${whatsappLink}" style="background-color: #25d366; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">JOIN WHATSAPP GROUP</a>
            </div>

            <!-- Portal Access -->
            <div style="background-color: #0c0000; border: 1px solid #ff0000; padding: 20px; margin-bottom: 25px; border-radius: 5px;">
                <h3 style="color: #ff0000; margin-top: 0; text-transform: uppercase; font-size: 16px;">Step 2: Access the Tech Portal</h3>
                <p style="color: #ffffff;">Download required data, manage your profile, and receive further transmissions at:</p>
                <p style="text-align: center; margin: 15px 0;">
                    <a href="https://${portalUrl}" style="color: #ff0000; font-weight: bold; font-size: 18px; text-decoration: underline;">${portalUrl}</a>
                </p>
                
                <div style="background-color: #1a0000; padding: 15px; border-radius: 4px; border-left: 4px solid #ff0000;">
                    <p style="margin: 0; color: #ffbaba; font-size: 14px; font-weight: bold; text-transform: uppercase; margin-bottom: 10px;">Login Credentials:</p>
                    <p style="margin: 5px 0; color: #ffffff;"><strong>Email:</strong> ${leaderEmail}</p>
                    <p style="margin: 5px 0; color: #ffffff;"><strong>Password:</strong> <span style="font-family: monospace; background: #330000; padding: 2px 4px;">${teamPassword}</span></p>
                    
                    <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #330000;">
                        <p style="margin: 0; color: #888; font-size: 12px; font-style: italic;"><strong>Proper Example:</strong></p>
                        <p style="margin: 5px 0; color: #aaa; font-size: 12px;">If leader is <strong style="color: #ccc;">Aditya Dev</strong> and phone is <strong style="color: #ccc;">9876543210</strong></p>
                        <p style="margin: 0; color: #aaa; font-size: 12px;">Password is <strong style="color: #ff0000; font-family: monospace;">adityadev-43210</strong></p>
                    </div>
                </div>
            </div>

            <!-- Secret Code for Attendance -->
            <div style="background-color: #111111; border: 1px dashed #555555; padding: 20px; margin-bottom: 25px; border-radius: 5px; text-align: center;">
                <p style="margin: 0; color: #888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Your Secret Attendance Code</p>
                <h2 style="margin: 10px 0; color: #ffffff; font-family: monospace; letter-spacing: 5px; font-size: 32px; border: 1px solid #222; display: inline-block; padding: 5px 20px; background: #000;">${teamCode}</h2>
                <p style="margin: 0; color: #ff0000; font-size: 14px; font-weight: bold;">KEEP THIS CODE SAFE. Use it for marking attendance on campus.</p>
            </div>

            <div class="highlight-box" style="background-color: #0c0000; border: 1px solid #ff0000; padding: 20px; margin: 30px 0;">
                <ul style="list-style: none; padding: 0; margin: 0;">
                    <li style="margin-bottom: 10px; color: #ffffff;"><strong style="color: #ff0000; width: 100px; display: inline-block; text-transform: uppercase; font-size: 12px;">Event:</strong> Xperience 3.0</li>
                    <li style="margin-bottom: 10px; color: #ffffff;"><strong style="color: #ff0000; width: 100px; display: inline-block; text-transform: uppercase; font-size: 12px;">Round:</strong> Offline Finals</li>
                    <li style="margin-bottom: 10px; color: #ffffff;"><strong style="color: #ff0000; width: 100px; display: inline-block; text-transform: uppercase; font-size: 12px;">Venue:</strong> Campus Grounds</li>
                </ul>
            </div>

            <p style="text-align: center; color: #888; font-size: 14px; font-style: italic; margin-bottom: 20px;">Confirm your entry before the gate closes:</p>
            
            <div class="cta-container" style="text-align: center; margin: 40px 0;">
                <a href="${confirmationLink}" style="background-color: #000000; color: #ff0000 !important; padding: 15px 35px; text-decoration: none; border: 2px solid #ff0000; font-weight: bold; font-size: 18px; display: inline-block; text-transform: uppercase; letter-spacing: 2px;">Confirm Participation</a>
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
