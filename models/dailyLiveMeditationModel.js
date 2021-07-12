const mongoose=require('mongoose');

const DLMSchema=mongoose.Schema({
    track_id: mongoose.Schema.Types.ObjectId(),
    title: String,
    description: String,
    live_meditation_track: String,
    time_slot: String,
    current_status: String
});

module.exports=mongoose.model('DLMSchema', DLMSchema);