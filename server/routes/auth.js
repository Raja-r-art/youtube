const router = require("express").Router();
const { register, login, googleAuth, logout, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleAuth);
router.post("/logout", logout);
router.get("/me", protect, getMe);

module.exports = router;
