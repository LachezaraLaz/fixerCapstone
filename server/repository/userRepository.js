const fixerClientObject = require('../model/fixerClientModel');

/**
 * @module server/repository
 */

/**
 * A class representing a repository for users.
 * @class UserRepository
 */
class UserRepository {
    /**
     * Finds a user by their email address.
     *
     * @param {string} email - The email address of the user to find.
     * @returns {Promise<Object|null>} A promise that resolves to the user object if found, or null if not found.
     * @memberof module:server/repository
     */
    async findByEmail(email) {
        return await fixerClientObject.fixerClient.findOne({ email });
    }

    /**
     * Finds a user by their ID.
     *
     * @param {string} userId - The ID of the user to find.
     * @returns {Promise<Object>} A promise that resolves to the user object if found, or null if not found.
     * @memberof module:server/repository
     */
    async findById(userId) {
        return await fixerClientObject.fixerClient.findById(userId);
    }

    /**
     * Creates a new user with the provided user data.
     *
     * @param {Object} userData - The data of the user to be created.
     * @param {string} userData.name - The name of the user.
     * @param {string} userData.email - The email of the user.
     * @param {string} userData.password - The password of the user.
     * @returns {Promise<Object>} A promise that resolves to the created user object.
     * @memberof module:server/repository
     */
    async createUser(userData) {
        return await fixerClientObject.fixerClient.create(userData);
    }

    /**
     * Updates a user with the given userId and updateData.
     *
     * @param {string} userId - The ID of the user to update.
     * @param {Object} updateData - The data to update the user with.
     * @returns {Promise<Object>} The updated user object.
     * @memberof module:server/repository
     */
    async updateUser(userId, updateData) {
        return await fixerClientObject.fixerClient.findByIdAndUpdate(userId, updateData, { new: true });
    }
}

module.exports = new UserRepository();
