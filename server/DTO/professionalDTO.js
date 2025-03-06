class ProfessionalDTO {
    constructor({ firstName, lastName, email, password, approved = false, accountType = 'professional', verified = false }) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.approved = approved;
        this.accountType = accountType;
        this.verified = verified;
    }

    static fromRequestBody(body) {
        return new ProfessionalDTO({
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email,
            password: body.password
        });
    }
}

module.exports = ProfessionalDTO;
