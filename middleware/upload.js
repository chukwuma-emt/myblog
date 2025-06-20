const multer = require('multer')
const path = require('path')

//storage config
const storage = multer.diskStorage({
    destination: ( req, file, cb)=> {
        cb(null, 'public/uploads/')
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

//file filter for image types
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else{
        cb(new Error('only jpeg and png is allowed'), false);
    }
};

const upload = multer({ storage, fileFilter});
module.exports = upload