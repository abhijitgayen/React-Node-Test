const MeetingHistory = require('../../model/schema/meeting');
const mongoose = require('mongoose');

// Add a new meeting
const add = async (req, res) => {
    try {
        const { agenda, attendes, attendesLead, location, related, dateTime, notes, createBy } = req.body;

        const newMeeting = new MeetingHistory({
            agenda,
            attendes,
            attendesLead,
            location,
            related,
            dateTime,
            notes,
            createBy
        });

        await newMeeting.save();
        res.status(200).json(newMeeting);
    } catch (error) {
        console.error('Error adding meeting:', error);
        res.status(500).json({ message: 'Internal Server Error', error });
    }
};

// Get all meetings
const index = async (req, res) => {
    const query = req.query
    query.deleted = false;

    let allData = await MeetingHistory.find(query).populate({
        path: 'createBy',
        match: { deleted: false } // Populate only if createBy.deleted is false
    }).exec()

    const result = allData.filter(item => item.createBy !== null);
    res.send(result)
};

// Get a single meeting by ID
const view = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid meeting ID' });
    }

    const meeting = await MeetingHistory.findById(id).populate({
        path: 'createBy',
        match: { deleted: false } // Populate only if createBy.deleted is false
    }).exec();
    
    if (!meeting) {
        return res.status(404).json({ message: 'Meeting not found' });
    }

    res.status(200).json(meeting);
};

// Delete a single meeting by ID
const deleteData = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid meeting ID' });
        }

        const deletedMeeting = await MeetingHistory.findByIdAndDelete(id);
        if (!deletedMeeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        res.status(200).json({ message: 'done', deletedMeeting });
    } catch (error) {
        console.error('Error deleting meeting:', error);
        res.status(500).json({ message: 'Internal Server Error', error });
    }
};

// Delete multiple meetings
const deleteMany = async (req, res) => {
    try {
        const { ids } = req.body; // Expecting an array of meeting IDs

        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ message: 'Invalid input, expected an array of IDs' });
        }

        const deletedMeetings = await MeetingHistory.deleteMany({ _id: { $in: ids } });

        res.status(200).json({ message: 'done', deletedMeetings });
    } catch (error) {
        console.error('Error deleting multiple meetings:', error);
        res.status(500).json({ message: 'Internal Server Error', error });
    }
};

module.exports = { add, index, view, deleteData, deleteMany };
