class RegisterUserDto {
    constructor({ email, firstName, lastName, password, street, postalCode, provinceOrState, country }) {
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.password = password;
        this.street = street;
        this.postalCode = postalCode;
        this.provinceOrState = provinceOrState;
        this.country = country;
    }
}

class AuthResponseDto {
    constructor(user, token, streamToken) {
        this.userId = user._id;
        this.userName = `${user.firstName} ${user.lastName}`;
        this.token = token;
        this.streamToken = streamToken;
    }
}

module.exports = { RegisterUserDto, AuthResponseDto };
