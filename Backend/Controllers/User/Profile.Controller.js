const { Profile, User } = require("../../Models/associations.js");

exports.getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.findAll({
      include: [{ model: User, attributes: ["name", "email"] }],
    });
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✏️ تعديل بروفايل
exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { Address, DOB } = req.body;
    
    const profile = await Profile.findByPk(id);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    await profile.update({ Address, DOB });
    res.json({ message: "Profile updated successfully", profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProfileByID = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await Profile.findByPk(id, {
      include: [{ model: User, attributes: ["name", "email"] }],
    });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🗑️ حذف بروفايل
exports.deleteProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await Profile.findByPk(id);

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    
    await profile.destroy();
    res.json({ message: "Profile deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📋 عرض بروفايل محدد
exports.getProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await Profile.findByPk(id, {
      include: [{ model: User, attributes: ["name", "email"] }],
    });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
