const bcrypt = require('bcrypt');
const saltRounds = 12;
const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process');
const dotenv = require('dotenv');
dotenv.config();
const configvar = require('../../config/configvar');
const common = require('../../utils/common');
const allLang = require('../../languages/allLang');
const { queryService} = require('../../services');
const userValidation = require('../../validations/admin/user.validation');
const sendMail = require('../../config/sendMail');

module.exports.userAdd = async function (req, res) {
    const lang = common.getLang(req);
console.log(req.body)
    //  Validate the input data
    const validate = await userValidation.userAdd(req);
    if (validate.code !== 200) {
        return res.status(400).json({
            code: validate.code,
            status: validate.status,
            message: validate.message,
        });
    }
        console.log('validate')
    try {
            const bodyData = req.body;
        
            // Check if the email already exists
          console.log(bodyData)
            const emailExists = await queryService.getDataByConditions("users", { email: bodyData.email });

            console.log('Email Exists:', emailExists); // For debugging

            // Validate the existence and structure of emailExists
            if (emailExists.length > 0 && emailExists[0].deleted_at === null) {
                return res.json({
                    code: configvar.error_code,
                    status: configvar.error_status,
                    message: allLang[lang].email_already_exists,
                });
            }else{
                console.log('not exist')
                let password = "";
                for (let i = 0; i < 8; i++) {
                    const letters = "abcdefghijklmnopqrstuvwxyz0123456789"; // Only letters
                    password += letters.charAt(Math.floor(Math.random() * letters.length));
                }
                const hashedPassword = await bcrypt.hash(password, saltRounds);
                // Email does not exist: Insert a new user
                const insertData = {
                    first_name: bodyData.first_name,
                    last_name: bodyData.last_name,
                    email: bodyData.email,
                    role:bodyData.role,
                    password: hashedPassword
                };

                const resultData = await queryService.insertData("users", insertData);
                if (!resultData ) {
                    return res.status(500).json({
                        code: 500,
                        status: "error",
                        message: allLang[lang].user_creation_failed,
                    });
                }
                const mailOptions = {
                    from: process.env.SMTP_AUTH_USER,
                    to: [bodyData.email],
                    subject: allLang[lang].user_added_by_admin,
                    html: `
                    <div style="font-family: Arial, sans-serif; color: #333;">
                            <h1>Welcome, ${bodyData.first_name} ${bodyData.last_name}!</h1>
                            <p>An account has been created for you by the admin on Otix.</p>
                            <h3>Your Login Details:</h3>
                            <p><strong>Email:</strong> ${bodyData.email}</p>
                            <p><strong>Password:</strong> ${password}</p>
                            <p>If you did not expect this account creation, please contact support.</p>
                            <br><br>Best Regards,<br>The Team Otix
                        </div>
                    `,
                };

                // Send the email
                sendMail.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error('Error sending email:', error);
                        return res.json({
                            code: configvar.error_code,
                            status: configvar.error_status,
                            message: allLang[lang].something_went_wrong,
                        });
                    }

                    // Return success response for updating an existing user
                    return res.status(200).json({
                        code: 200,
                        status: "success",
                        message: allLang[lang].user_created_success,
                        // data: {
                        //     u_id: userRecord.u_id,
                        //     ...updatedData,
                        // },
                    });
                });
            }

        } catch (error) {
            console.error("Error in userAdd API:", error);
            return res.status(500).json({
                code: 500,
                status: "error",
                message: allLang[lang].something_went_wrong || "Something went wrong. Please try again later.",
            });
        }
        
};


