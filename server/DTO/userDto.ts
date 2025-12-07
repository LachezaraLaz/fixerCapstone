import { IFixerClient } from "../model/fixerClient";


interface IRegisterUserDto{
    accountType: string;
    approved: boolean;
    country: string;
    email: string;
    id:string;
    firstName: string;
    lastName: string;
    password: string;
    postalCode: string;
    provinceOrState: string;
    street: string;
    verified: boolean;
    verificationToken:string;
}

interface IAuthResponseDto {
    user: IFixerClient;
    token: string;
    streamToken: string;
}
 
 
 
 
 class RegisterUserDto {
    public accountType: string
    public approved: boolean
    public country: string
    public email: string;
    public firstName: string
    public lastName: string
    public password: string
    public postalCode: string
    public provinceOrState: string
    public street: string
    public verified: boolean
    public id: string
    public verificationToken:string;

    constructor({ ...user }: IRegisterUserDto) {
        this.email = user.email;
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.password = user.password;
        this.street = user.street;
        this.postalCode = user.postalCode;
        this.provinceOrState = user.provinceOrState;
        this.country = user.country;
        this.approved = user.approved;
        this.accountType = user.accountType;
        this.verified = user.verified;
        this.id = user.id
        this.verificationToken = user.verificationToken;
    }


     get userInfo():IRegisterUserDto{
        return {
            id:this.id,
            email: this.email,
            firstName: this.firstName,
            lastName: this.lastName,
            street: this.street,
            postalCode: this.postalCode,
            provinceOrState: this.provinceOrState,
            country: this.country,
            approved: this.approved,
            accountType: this.accountType,
            verified: this.verified,
            password: this.password,
            verificationToken: this.verificationToken
        }
    }
}

 class AuthResponseDto {
    public userId: string;
    public token: string;
    public streamToken: string;


    constructor({user, token, streamToken}: IAuthResponseDto) {
        this.userId = user.id;
        this.token = token;
        this.streamToken = streamToken;
    }
}

export { RegisterUserDto, IRegisterUserDto, AuthResponseDto, IAuthResponseDto };

