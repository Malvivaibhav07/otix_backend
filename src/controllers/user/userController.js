const dotenv = require('dotenv');
dotenv.config();
const configvar = require('../../config/configvar');
const common = require('../../utils/common');
const allLang = require('../../languages/allLang');
const { queryService} = require('../../services');


module.exports.getUserProfile = async function (req, res) {

    const user_id = req.user.id;
     if (!user_id || user_id.length == 0) {
            return res.json({
                code: configvar.error_code,
                status: configvar.error_status,
                message: 'user_id not found.'
            });
        }
    condition = {u_id: user_id}

    try {
        const userData = await queryService.getDataByConditions('users', condition );
        if (!userData) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({
            success: true,
            message: 'Profile fetched successfully',
            data: userData
        });

    } catch (error) {
        return res.status(500).json({ message: 'Something went wrong' });
    }
}
