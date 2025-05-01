


const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 12;
const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process');
const dotenv = require('dotenv');
dotenv.config();
const configvar = require('../../config/configvar');
const common = require('../../utils/common');
const allLang = require('../../languages/allLang');
const { queryService} = require('../../services');
const { authValidation} = require('../../validations/user');


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
                let datares = userInfo;

                bcrypt.compare(bodyData.password, resultData[0].password, async function(err, result) {
                    if (err) {
                        return res.json({
                            code: configvar.error_code,
                            status: configvar.error_status,
                            message: allLang[lang].password_invalid
                        });
                    }
                    if (result) {
                        if (userInfo.status === 'Disable') {
                            return res.json({
                                code: configvar.error_code,
                                status: configvar.error_status,
                                message: allLang[lang].account_disabled
                            });
                        }
                    }
                        // else if(userInfo.is_email_verified === 0 ) {
                        //     let mailInfo = await commonController.sendEmailOTP({ params: { id: resultData[0].u_id, lang: lang } });
                            
                            // let phone_otp = Math.floor(1000 + Math.random() * 9000);
                            // let newData = { phone_otp: phone_otp };
                            // let conditions = { u_id: resultData[0].u_id };
                            // await queryService.updateData('users', newData, conditions);

                           
                            // if(mailInfo.code === 200) {
                            //     return res.json({
                            //         code: configvar.success_code,
                            //         status: configvar.success_status,
                            //         message: allLang[lang].email_address_phone_number_not_verified_nd_verify_first,
                            //         data: datares
                            //     });
                            // }
                            // else if(mailInfo.code !== 200) {
                            //     return res.json({
                            //         code: mailInfo.code,
                            //         status: mailInfo.status,
                            //         message: mailInfo.message
                            //     });
                            // }
                            // 
                            // else {
                            //     return res.json({
                            //         code: configvar.error_code,
                            //         status: configvar.error_status,
                            //         message: allLang[lang].something_went_wrong
                            //     });
                            // }
                        // }
                        else {
                            const accesstoken = jwt.sign({
                                id: resultData[0].u_id
                            }, process.env.APP_USER_ACCESS_TOKEN_SECRET, {
                                expiresIn: "1h",
                                issuer: 'platform',
                                jwtid: uuidv4()
                            });
                            datares = {
                                ...userInfo,
                                accesstoken,
                                // refreshtoken
                            };

                            return res.json({
                                code: configvar.success_code,
                                status: configvar.success_status,
                                message: allLang[lang].login_successfully,
                                data: datares
                            });
                        }
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
                    // return sendVerification(previousUser.u_id, bodyData, lang, res);
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