require('dotenv').config();
const mongoose = require('mongoose');
const Video = require('./models/Video');
const User = require('./models/User');

async function clean() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Delete the seeded videos by their known titles
    const seedTitles = ['Big Buck Bunny 4K','Elephant Dream','For Bigger Blazes','For Bigger Joyrides','Tears of Steel','Sintel'];
    const result = await Video.deleteMany({ title: { $in: seedTitles } });
    console.log('Deleted', result.deletedCount, 'dummy videos');
    
    // Delete the dummy user (blender@example.com) if no videos remain for them
    const blender = await User.findOne({ email: 'blender@example.com' });
    if (blender) {
      const remaining = await Video.countDocuments({ uploader: blender._id });
      if (remaining === 0) {
        await User.deleteOne({ _id: blender._id });
        console.log('Deleted dummy user: blender@example.com');
      } else {
        console.log('Kept blender user (has', remaining, 'non-seed videos)');
      }
    }
    
    const total = await Video.countDocuments();
    console.log('Remaining videos:', total);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
clean();
