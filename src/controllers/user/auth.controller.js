const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 12;
const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process');
const dotenv = require('dotenv');
dotenv.config();
const configvar = require('../../config/configvar');
const common = require('../../utils/common');
const allLang = require('../../languages/allLang.json');
const { queryService} = require('../../services');
const { authValidation} = require('../../validations/user');
const sendMail = require('../../config/sendMail');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const pdfService = require('../../services/pdf.service')

module.exports.login = async function (req, res) {
    const lang = common.getLang(req);

    const validate = await authValidation.login(req);
    if(validate.code !== 200) {
        return res.json({
            code: validate.code,
            status: validate.status,
            message: validate.message
        });
    }
    else {
        const bodyData = req.body;
        console.log("object")
        
       
        if (!bodyData || bodyData.length == 0) {
            return res.json({
                code: configvar.error_code,
                status: configvar.error_status,
                message: allLang[lang].data_not_found
            });
        }
        
        try {
            let conditions = { email: bodyData.email };
            let resultData = await queryService.getDataByConditionsOrderBy('users', conditions, 'u_id DESC');
            
            if (resultData.length === 0 || (resultData.length > 0 && resultData[0].deleted_at !== null)) {
                return res.json({
                    code: configvar.error_code,
                    status: configvar.error_status,
                    message: allLang[lang].email_address_invalid
                });
            }
            else {
                let userInfo = {
                    u_id: resultData[0].u_id,
                    first_name: resultData[0].first_name,
                    last_name: resultData[0].last_name,
                    email: resultData[0].email,
                    is_email_verified: resultData[0].is_email_verified,
                    status: resultData[0].status,
                    
                };
                console.log(userInfo);
                
                  const isPasswordValid = await bcrypt.compare(bodyData.password,resultData[0].password);

                  if (!isPasswordValid) {
                    return res.json({
                      code: configvar.error_code,
                      status: configvar.error_status,
                      message: allLang[lang].password_invalid,
                    });
                  }

                  if (userInfo.status === "Disable") {
                    return res.json({
                      code: configvar.error_code,
                      status: configvar.error_status,
                      message: allLang[lang].account_disabled,
                    });
                  }

                 // Check if email is verified
                if (!userInfo.is_email_verified) {
                    const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
                    await queryService.updateData('users', { email_otp: otp }, { email: bodyData.email });

                    const mailOptions = {
                        from: process.env.SMTP_AUTH_USER,
                        to: [bodyData.email],
                        subject: allLang[lang].verify_user_subject,
                        html: `
                            <div style="font-family: Arial, sans-serif; color: #333;">
                                <h1>${allLang[lang].user_mail_l1} ${userInfo.first_name} ${userInfo.last_name}!</h1>
                                <p>Please verify your email to complete your registration.</p>
                                <p>Your OTP is:</p>
                                <h2>${otp}</h2>
                                <p>This OTP is valid for 10 minutes. Use it on the verification page.</p>
                                <br><br>Best Regards,<br>The Team Otix
                            </div>
                        `,
                    };

                    // Send verification email
                    return sendMail.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            console.error('Error sending verification email:', error);
                            return res.json({
                                code: configvar.error_code,
                                status: configvar.error_status,
                                message: allLang[lang].something_went_wrong,
                            });
                        }

                        return res.json({
                            code: configvar.success_code,
                            status: configvar.success_status,
                            message: allLang[lang].verification_mail_sent,
                        });
                    });
                }
                   // Create JWT access token after all validations 
                  const accesstoken = jwt.sign(
                    {
                      id: resultData[0].u_id,
                    },
                    process.env.APP_USER_ACCESS_TOKEN_SECRET,
                    {
                      expiresIn: "1h",
                      issuer: "platform",
                      jwtid: uuidv4(),
                    }
                  );

                  const datares = {
                    ...userInfo,
                    accesstoken,
                  };

                  return res.json({
                    code: configvar.success_code,
                    status: configvar.success_status,
                    message: allLang[lang].login_successfully,
                    data: datares,
                  });
                } 
            
        } catch (error) {
            console.error("Error : ", error);
            
            return res.json({
                code: configvar.error_code,
                status: configvar.error_status,
                message: allLang[lang].something_went_wrong
            });
        }
    }
};

module.exports.signup = async function (req, res) {
    const lang = common.getLang(req);

    const validate = await authValidation.signup(req);
    if(validate.code !== 200) {
        return res.json({
            code: validate.code,
            status: validate.status,
            message: validate.message
        });
    }
    else {
        const bodyData = req.body;
        
        if (!bodyData || bodyData.length == 0) {
            return res.json({
                code: configvar.error_code,
                status: configvar.error_status,
                message: allLang[lang].data_not_found
            });
        }

        try {
     
            let conditions = { email: bodyData.email };
            let resultData = await queryService.getDataByConditionsOrderBy('users', conditions, 'u_id DESC');

            if (resultData.length > 0 && resultData[0].deleted_at === null) {
                return res.json({
                    code: configvar.error_code,
                    status: configvar.error_status,
                    message: allLang[lang].email_already_registered
                });
            }
         

            // Reactivate soft-deleted user
            const previousUser = (resultData.length > 0 && resultData[0].deleted_at !== null) ? resultData[0] : null;

            const hashedPassword = await bcrypt.hash(bodyData.password, saltRounds);

            const userCommonData = {
                first_name: bodyData.first_name,
                last_name: bodyData.last_name,
                email: bodyData.email,
                password: hashedPassword,
                
            };

            if (previousUser) {
                   
                const updateData = {
                    ...userCommonData,
                    created_at: new Date(),
                    deleted_at: null,
                };

                const updatedData = await queryService.updateData('users', updateData, { u_id: previousUser.u_id });
                                
                if (updatedData !== 0) {
                    return sendVerification(previousUser.u_id, bodyData, lang, res);
                    return res.json({
                        code: configvar.success_code,
                        status: configvar.success_status,
                        message: allLang[lang].registered_successfully,
                    });

                } else {
                    return res.json({
                        code: configvar.error_code,
                        status: configvar.error_status,
                        message: allLang[lang].something_went_wrong,
                    });
                }
            } else {
                // New registration
                const insertResult = await queryService.insertData('users', userCommonData);
                if (insertResult.insertId !== 0) {
                    return sendVerification(insertResult.insertId, bodyData, lang, res);
                    return res.json({
                        code: configvar.success_code,
                        status: configvar.success_status,
                        message: allLang[lang].registered_successfully,
                    });
                } else {
                    return res.json({
                        code: configvar.error_code,
                        status: configvar.error_status,
                        message: allLang[lang].something_went_wrong,
                    });
                }
            }
        } catch (error) {
            console.error("Signup Error:", error);
            return res.json({
                code: configvar.error_code,
                status: configvar.error_status,
                message: allLang[lang].something_went_wrong,
            });
        }
    };

}

async function sendVerification(userId, bodyData, lang, res) {
    
     // Generate OTP and save it in the database
        const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
        // const otpExpiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
        await queryService.updateData('users', { email_otp: otp }, { email: bodyData.email });

    const mailOptions = {
        from: process.env.SMTP_AUTH_USER,
            to: [bodyData.email],
            subject: allLang[lang].verify_user_subject,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h1>${allLang[lang].user_mail_l1} ${bodyData.first_name} ${bodyData.last_name}!</h1>
                    <p>Thank you for registering with us! Please verify your email to complete your registration.</p>
                    <p>Here is your OTP:</p>
                    <h2>${otp}</h2>
                    <p>This OTP is valid for 10 minutes. Please use it on the verification page to verify your account.</p>
                    <p>If you did not register for this account, please ignore this email.</p>
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

            return res.json({
                code: configvar.success_code,
                status: configvar.success_status,
                message: allLang[lang].verification_mail_sent,
            });
        });
}


module.exports.forgotPassword = async function (req, res) {
    const lang = common.getLang(req);

    const validate = await authValidation.forgotPassword(req);
    if (validate.code !== 200) {
        return res.json({
            code: validate.code,
            status: validate.status,
            message: validate.message,
        });
    }else {
        try {
            const bodyData = req.body;

            // Check if the email exists in the database
            let conditions = { email: bodyData.email };
            let resultData = await queryService.getDataByConditions('users', conditions);
            if (resultData.length === 0) {
                return res.json({
                    code: configvar.error_code,
                    status: configvar.error_status,
                    message: allLang[lang].email_address_invalid,
                });
            } 

            // console.log(resultData)
            //generate OTP & save in db
            const otp = Math.floor(100000 + Math.random() * 900000);
            await queryService.updateData('users', { email_otp: otp }, { u_id: resultData[0].u_id });

            console.log(otp)
            //send otp via mail
            console.log(process.env.SMTP_AUTH_USER)
            const mailOptions = {
                from: process.env.SMTP_AUTH_USER,
                to: [bodyData.email],// resultData[0].email
                subject: allLang[lang].otp_email_subject,
                html: `<p>${allLang[lang].user_otp_email_body} <strong>${otp}</strong><br><br>Best Regards,<br>The team Otix</p>`,
            };
            console.log(mailOptions)
            
           
            sendMail.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending mail:', error);
                    return res.json({
                        code: configvar.error_code,
                        status: configvar.error_status,
                        message: allLang[lang].something_went_wrong,
                    });
                }
    
                // On success, send the success response
                return res.json({
                    code: configvar.success_code,
                    status: configvar.success_status,
                    message: allLang[lang].otp_sent_successfully,
                });
            });
            
          
        }catch (error) {
            console.error('Error: ', error);
            return res.json({
                code: configvar.error_code,
                status: configvar.error_status,
                message: allLang[lang].something_went_wrong,
            });
        }
    }
}


module.exports.verifyOtp = async function (req, res) {
    const lang = common.getLang(req);
    const { email, otp } = req.body;

    // Validate input
    const validate = await authValidation.verifyOtpValidation(req);
    if (validate.code !== 200) {
        return res.json({
            code: validate.code,
            status: validate.status,
            message: validate.message,
        });
    }

    try {
        const bodyData = req.body;
        // Check if the email exists in the database
        let conditions = { email: bodyData.email };
        let resultData = await queryService.getDataByConditions('users', conditions);
        
        if (resultData.length === 0) {
            return res.json({
                code: configvar.error_code,
                status: configvar.error_status,
                message: allLang[lang].email_invalid,
            });
        }

        // Check if the OTP matches the one in the database
        if (resultData[0].email_otp !== bodyData.email_otp) {
            return res.json({
                code: configvar.error_code,
                status: configvar.error_status,
                message: allLang[lang].invalid_otp,
            });
        }
        if (!resultData[0].is_email_verified) {
            // This is likely registration OTP verification
            await queryService.updateData('users', {
                email_otp: null,
                is_email_verified: 1
            }, { u_id: resultData[0].u_id });
        } else {
            // This is likely forgot-password OTP
            await queryService.updateData('users', {
                email_otp: null
            }, { u_id: resultData[0].u_id });
        }
       
        // OTP verified successfully
        return res.json({
            code: configvar.success_code,
            status: configvar.success_status,
            message: allLang[lang].otp_verified_successfully,
        });

    } catch (error) {
        console.error('Error: ', error);
        return res.json({
            code: configvar.error_code,
            status: configvar.error_status,
            message: allLang[lang].something_went_wrong,
        });
    }
};

module.exports.resetPassword = async function (req, res) {
    const lang = common.getLang(req);
    const { email,newPassword } = req.body;

    // Validate input
    const validate = await authValidation.resetPasswordValidation(req);
    if (validate.code !== 200) {
        return res.json({
            code: validate.code,
            status: validate.status,
            message: validate.message,
        });
    }

    try {
        const bodyData = req.body;
        // Check if the email exists in the database
        let conditions = { email: bodyData.email };
        let resultData = await queryService.getDataByConditions('users', conditions);
        
        if (resultData.length === 0) {
            return res.json({
                code: configvar.error_code,
                status: configvar.error_status,
                message: allLang[lang].email_invalid,
            });
        }

         bcrypt.compare(bodyData.newPassword, resultData[0].password, async function(err, result) {
            if (result) {
                return res.json({
                    code: configvar.error_code,
                    status: configvar.error_status,
                    message: allLang[lang].new_password_should_not_same_as_old
                });
            }
            else{
               
                // Hash the new password
                const hashedPassword = await bcrypt.hash(bodyData.newPassword, saltRounds);

                // Update the password in the database
                await queryService.updateData('users', { password: hashedPassword }, { u_id: resultData[0].u_id });

                
                // Success response
                return res.json({
                    code: configvar.success_code,
                    status: configvar.success_status,
                    message: allLang[lang].password_reset_successfully,
                });
            }
        })
    } catch (error) {
        console.error('Error: ', error);
        return res.json({
            code: configvar.error_code,
            status: configvar.error_status,
            message: allLang[lang].something_went_wrong,
        });
    }
};


module.exports.downloadPdf = async function (req, res) {
    try{
        const stream = res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=Finishing.pdf'
        })

        pdfService.buildPdf(
            (chunk) => stream.write(chunk),
            () => stream.end()
        );
    }catch (error) {
        console.error('Download PDF error:', error);
        res.status(500).json({
            code: 500,
            status: 'error',
            message: 'Failed to download PDF'
        });
    }
}