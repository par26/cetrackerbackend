const Admin = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const getCommonTags = require("../utils/getCommonTags");
const Company = require("../models/companyModel");

exports.authenticateAdmin = (req, res, next) => {
    try {
        const autHeader = req.headers["authorization"];
        const token = autHeader && autHeader.splice(" ")[1];

        if (token == null) {
            return req.sendStatus(401);
        }

        jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET,
            async (err, adminID) => {
                if (err) res.sendStatus(401);

                req.adminID = adminID;
                const admin = await Admin.findById(adminID);

                if (!admin) {
                    throw new Error("Invalid token.");
                }

                req.admin = admin;

                next();
            }
        );
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
};

exports.getRecommendedTags = catchAsync(async (req, res) => {
    const TAG_LIMITS = 7;

    const companies = await Company.find({ owner: req.user._id });
    const tags = getCommonTags(companies, TAG_LIMITS);

    res.status(200).json({
        status: "success",
        results: TAG_LIMITS,
        data: {
            tags: Array.from(tags.keys()),
        },
    });
});

//the admin create post request
exports.admin_create_post = async (req, res) => {
    var adminModel = new Admin({
        email: req.body.email,
        password: req.body.password,
        first_name: req.body.firstName,
        last_name: req.body.lastName,
        //classId: classId,
        phone_number: req.body.phone_number,
    });

    try {
        await adminModel.save();

        const access_token = Jwt.sign(
            admin._id,
            process.env.ACCESS_TOKEN_SECRET
        );

        res.json({ access_token: access_token });
        console.log("Request handled successfully");
    } catch (err) {
        res.status(400).send("Error saving member");
    }
};
