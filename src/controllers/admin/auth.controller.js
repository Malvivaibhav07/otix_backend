const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 12;
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');
dotenv.config();
const configvar = require('../../config/configvar');
const common = require('../../utils/common');
const allLang = require('../../languages/allLang.json');
const { queryService} = require('../../services');
const { authValidation} = require('../../validations/admin');
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
              
       
        if (!bodyData || bodyData.length == 0) {
            return res.json({
                code: configvar.error_code,
                status: configvar.error_status,
                message: allLang[lang].data_not_found
            });
        }
        
        try {
            let conditions = { email: bodyData.email };
            let resultData = await queryService.getDataByConditionsOrderBy('admin', conditions, 'a_id DESC');
            
            if (resultData.length === 0 || (resultData.length > 0 && resultData[0].deleted_at !== null)) {
                return res.json({
                    code: configvar.error_code,
                    status: configvar.error_status,
                    message: allLang[lang].email_address_invalid
                });
            }
            else {
                let adminInfo = {
                    a_id: resultData[0].a_id,
                    first_name: resultData[0].first_name,
                    last_name: resultData[0].last_name,
                    email: resultData[0].email,
                                        
                };
                console.log(adminInfo);
                
                  const isPasswordValid = await bcrypt.compare(bodyData.password,resultData[0].password);

                  if (!isPasswordValid) {
                    return res.json({
                      code: configvar.error_code,
                      status: configvar.error_status,
                      message: allLang[lang].password_invalid,
                    });
                  }

                   // Create JWT access token after all validations 
                  const accesstoken = jwt.sign(
                    {
                      id: resultData[0].a_id,
                    },
                    process.env.APP_ADMIN_ACCESS_TOKEN_SECRET,
                    {
                      expiresIn: "1h",
                      issuer: "platform",
                      jwtid: uuidv4(),
                    }
                  );

                  const datares = {
                    ...adminInfo,
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
            let resultData = await queryService.getDataByConditionsOrderBy('admin', conditions, 'a_id DESC');

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

                const updatedData = await queryService.updateData('admin', updateData, { a_id: previousUser.a_id });
                                
                if (updatedData !== 0) {
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
                const insertResult = await queryService.insertData('admin', userCommonData);
                if (insertResult.insertId !== 0) {
                    // return sendVerification(insertResult.insertId, bodyData, lang, res);
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
            let resultData = await queryService.getDataByConditions('admin', conditions);
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
            await queryService.updateData('admin', { email_otp: otp }, { a_id: resultData[0].a_id });

            console.log(otp)
            //send otp via mail
            console.log(process.env.SMTP_AUTH_USER)
            const mailOptions = {
                from: process.env.SMTP_AUTH_USER,
                to: [bodyData.email],// resultData[0].email
                subject: allLang[lang].otp_email_subject,
                html: `<p>${allLang[lang].otp_email_body} <strong>${otp}</strong><br><br>Best Regards,<br>The Team Otix</p>`,
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
        let resultData = await queryService.getDataByConditions('admin', conditions);
        
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
       
            
            await queryService.updateData('admin', {
                email_otp: null
            }, { a_id: resultData[0].a_id });
        
       
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
        let resultData = await queryService.getDataByConditions('admin', conditions);
        
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
                await queryService.updateData('admin', { password: hashedPassword }, { a_id: resultData[0].a_id });

                
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