const User = require('../model/Users');

// ✅ Admin dashboard overview
const dashboard = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: `Welcome Admin, ${req.user.name}`,
      userInfo: req.user
    });
  } catch (error) {
    console.error("❌ Admin dashboard error:", error.message || error);
    return res.status(500).json({
      success: false,
      message: "Server error while loading admin dashboard"
    });
  }
};

// ✅ Fetch all non-admin registered users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isAdmin: false }).select('-password');
    return res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.error("❌ Error fetching users:", error.message || error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch users"
    });
  }
};

// ✅ Fetch all admins
const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ isAdmin: true }).select('-password');
    return res.status(200).json({
      success: true,
      admins
    });
  } catch (error) {
    console.error("❌ Error fetching admins:", error.message || error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch admins"
    });
  }
};

// ✅ Delete a non-admin user by ID
const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Cannot delete an admin user"
      });
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });

  } catch (error) {
    console.error("❌ Delete user error:", error.message || error);
    return res.status(500).json({
      success: false,
      message: "Server error during user deletion"
    });
  }
};

module.exports = {
  dashboard,
  getAllUsers,
  getAllAdmins,
  deleteUser
};