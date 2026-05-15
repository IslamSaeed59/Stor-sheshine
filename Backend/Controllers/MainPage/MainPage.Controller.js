const { MainPage } = require("../../Models/associations");
const asyncHandler = require("../../Middleware/asyncHandler");

const path = require("path");
const fs = require("fs");

// Helper function to delete local files
const deleteLocalFile = async (imageUrl) => {
  if (!imageUrl || !imageUrl.startsWith("/uploads/")) return;
  try {
    const filePath = path.join(__dirname, "../../public", imageUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error("Local file deletion error:", err);
  }
};

exports.getMainPage = asyncHandler(async (req, res) => {
  const mainPage = await MainPage.findOne();
  if (!mainPage) {
    return res.status(404).json({ message: "MainPage data not found" });
  }
  res.json(mainPage);
});

exports.createMainPage = asyncHandler(async (req, res) => {
  const existing = await MainPage.findOne();
  if (existing) {
    return res.status(400).json({ message: "MainPage data already exists, please update instead" });
  }

  const {
    HeroName,
    HeroImage,
    HeroDescription,
    HeroButton,
    CollectionsName,
    CollectionsDescription,
    OfferName,
    OfferDescription,
    AboutName,
    AboutDescription,
    AboutImage,
  } = req.body;

  const mainPage = await MainPage.create({
    HeroName,
    HeroImage,
    HeroDescription,
    HeroButton,
    CollectionsName,
    CollectionsDescription,
    OfferName,
    OfferDescription,
    AboutName,
    AboutDescription,
    AboutImage,
  });

  res.status(201).json(mainPage);
});

exports.updateMainPage = asyncHandler(async (req, res) => {
  const mainPage = await MainPage.findOne();
  if (!mainPage) {
    return res.status(404).json({ message: "MainPage data not found" });
  }

  const {
    HeroImage,
    AboutImage,
  } = req.body;

  // Handle local image deletion for replaced or removed HeroImage
  if (req.body.hasOwnProperty('HeroImage') && Array.isArray(HeroImage)) {
     const newImageUrls = HeroImage.filter(img => typeof img === 'string');
     const oldHeroImage = mainPage.HeroImage || [];
     const imagesToDelete = oldHeroImage.filter(oldImg => !newImageUrls.includes(oldImg));
     
     if (imagesToDelete.length > 0) {
       await Promise.all(imagesToDelete.map(img => deleteLocalFile(img)));
     }
  }

  // Handle local image deletion for replaced or removed AboutImage
  if (req.body.hasOwnProperty('AboutImage') && Array.isArray(AboutImage)) {
     const newImageUrls = AboutImage.filter(img => typeof img === 'string');
     const oldAboutImage = mainPage.AboutImage || [];
     const imagesToDelete = oldAboutImage.filter(oldImg => !newImageUrls.includes(oldImg));
     
     if (imagesToDelete.length > 0) {
       await Promise.all(imagesToDelete.map(img => deleteLocalFile(img)));
     }
  }

  await mainPage.update(req.body);

  res.json(mainPage);
});

exports.deleteMainPage = asyncHandler(async (req, res) => {
  const mainPage = await MainPage.findOne();
  if (!mainPage) {
    return res.status(404).json({ message: "MainPage data not found" });
  }

  // Delete all images from local storage
  if (mainPage.HeroImage && mainPage.HeroImage.length > 0) {
     await Promise.all(mainPage.HeroImage.map(img => deleteLocalFile(img)));
  }
  if (mainPage.AboutImage && mainPage.AboutImage.length > 0) {
     await Promise.all(mainPage.AboutImage.map(img => deleteLocalFile(img)));
  }

  await mainPage.destroy();
  res.json({ message: "MainPage data removed" });
});
