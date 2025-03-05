const express = require('express');
const userController = require('../controllers/userController');
const carController = require('../controllers/carController')
const {jwtMiddleware,admin} = require('../middlewares/jwtMiddleware')
const multerMiddleware = require('../middlewares/multermiddleware')
const bookingController = require('../controllers/bookingController')
const router = express.Router();

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/verifyOtp', userController.verifyOtp);
// admin Crud
router.post('/add-car',jwtMiddleware,admin,multerMiddleware.single("image"),carController.addCar)
router.get('/viewCar',jwtMiddleware,admin,carController.getAllCars)
router.delete('/cars/:id/remove',jwtMiddleware,admin,carController.removeCarController)
router.put('/cars/:id/edit',jwtMiddleware,multerMiddleware.single('image'),carController.updateCar)
// user
router.post('/bookings',jwtMiddleware,bookingController.createBooking)
router.get('/allcars',jwtMiddleware,carController.getAllCarsUser)
router.put("/update/:bookingId", jwtMiddleware, bookingController.updateBooking);
router.get('/:bookingId',jwtMiddleware,bookingController.getBookingById)
router.get('/admin/bookings',jwtMiddleware,admin,bookingController.getAllBookings)
router.put('/:id/status',jwtMiddleware,admin,bookingController.updateBookingStatus)
router.get("/pdf/:bookingId", jwtMiddleware, bookingController.generateBookingPDF);
router.get('/user-bookings',jwtMiddleware,bookingController.getUserBookings)
module.exports = router;
