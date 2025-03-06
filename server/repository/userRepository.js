const fixerClientObject = require('../model/fixerClientModel');

class UserRepository {
    async findByEmail(email) {
        return await fixerClientObject.fixerClient.findOne({ email });
    }

    async findById(userId) {
        return await fixerClientObject.fixerClient.findById(userId);
    }

    async createUser(userData) {
        return await fixerClientObject.fixerClient.create(userData);
    }

    async updateUser(userId, updateData) {
        return await fixerClientObject.fixerClient.findByIdAndUpdate(userId, updateData, { new: true });
    }
}

module.exports = new UserRepository();
