require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Video = require("./models/Video");

const SEED_VIDEOS = [
  {
    title: "Big Buck Bunny 4K",
    description: "Big Buck Bunny tells the story of a giant rabbit with a heart bigger than himself.",
    url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/640px-Big_buck_bunny_poster_big.jpg",
    category: "Entertainment",
    views: 154323,
    duration: 596
  },
  {
    title: "Elephant Dream",
    description: "The first computer-generated animated short film made almost entirely with open source software.",
    url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Elephants_Dream_s5_both.jpg/640px-Elephants_Dream_s5_both.jpg",
    category: "Entertainment",
    views: 52312,
    duration: 654
  },
  {
    title: "For Bigger Blazes",
    description: "HBO GO now works with Chromecast",
    url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnail: "https://i.ytimg.com/vi/Dr9C2oswZfA/maxresdefault.jpg",
    category: "Entertainment",
    views: 2434,
    duration: 15
  },
  {
    title: "For Bigger Joyrides",
    description: "Chromecast commercial",
    url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    thumbnail: "https://i.ytimg.com/vi/y8mEn5T_r3Y/maxresdefault.jpg",
    category: "Entertainment",
    views: 12344,
    duration: 15
  },
  {
    title: "Tears of Steel",
    description: "Tears of Steel was realized with crowd-funding by users of the open source 3D creation tool Blender.",
    url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Tears_of_Steel_poster.jpg/640px-Tears_of_Steel_poster.jpg",
    category: "Education",
    views: 89432,
    duration: 734
  },
  {
    title: "Sintel",
    description: "Sintel is an independently produced short film, initiated by the Blender Foundation.",
    url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Sintel_poster.jpg/640px-Sintel_poster.jpg",
    category: "Education",
    views: 94321,
    duration: 888
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing
    await User.deleteMany();
    await Video.deleteMany();

    // Create a demo creator user
    const uploader = await User.create({
      name: "Blender Foundation",
      email: "blender@example.com",
      password: "password123",
      avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Blender_logo_no_text.svg/512px-Blender_logo_no_text.svg.png",
      channelName: "Blender Official",
      bio: "Official Blender channel."
    });

    console.log("Created user:", uploader.email);

    // Insert videos
    const videosToInsert = SEED_VIDEOS.map(v => ({
      ...v,
      uploader: uploader._id,
      status: "ready",
      visibility: "public"
    }));

    await Video.insertMany(videosToInsert);
    console.log("Seeded", videosToInsert.length, "videos!");

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();
