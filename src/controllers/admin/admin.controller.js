const dotenv = require('dotenv');
dotenv.config();
const configvar = require('../../config/configvar');
const common = require('../../utils/common');
const allLang = require('../../languages/allLang');
const { queryService} = require('../../services');


module.exports.getAdminProfile = async function (req, res) {
    const admin_id = req.admin.id;
    condition = {a_id : admin_id}

    try {
        const adminData = await queryService.getDataByConditions('admin', condition );
        if (!adminData) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        return res.status(200).json({
            success: true,
            message: 'Profile fetched successfully',
            data: adminData
        });

    } catch (error) {
        return res.status(500).json({ message: 'Something went wrong' });
    }
}
