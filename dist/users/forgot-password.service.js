"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgotPasswordService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./user.entity");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const crypto_1 = require("crypto");
let ForgotPasswordService = class ForgotPasswordService {
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
        this.otpStorage = new Map();
    }
    generateOtp() {
        return (0, crypto_1.randomBytes)(3).toString('hex');
    }
    async sendEmail(to, otp) {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL_USER,
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
            },
        });
        console.log(process.env.EMAIL_USER, process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REFRESH_TOKEN);
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: 'Your OTP Code',
            text: `Your OTP code is: ${otp}`,
        };
        try {
            await transporter.sendMail(mailOptions);
            console.log(`OTP sent to: ${to}`);
        }
        catch (error) {
            console.error('Email sending error:', error);
            throw new common_1.InternalServerErrorException('Error sending OTP');
        }
    }
    async sendOTP(email) {
        const user = await this.usersRepository.findOne({ where: { email } });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        const otp = this.generateOtp();
        this.otpStorage.set(email, { otp, expiresAt: Date.now() + 300000 });
        try {
            await this.sendEmail(user.email, otp);
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to send OTP email');
        }
        return { message: 'OTP sent to your email' };
    }
    async verifyOTP(email, otp) {
        const storedOtp = this.otpStorage.get(email);
        if (!storedOtp || storedOtp.otp !== otp || Date.now() > storedOtp.expiresAt) {
            throw new common_1.BadRequestException('Invalid or expired OTP');
        }
        this.otpStorage.delete(email);
        return { message: 'OTP verified successfully' };
    }
    async resetPassword(email, otp, newPassword) {
        await this.verifyOTP(email, otp);
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.usersRepository.update({ email }, { password: hashedPassword });
        return { message: 'Password reset successful' };
    }
    async forgotPassword(email) {
        return this.sendOTP(email);
    }
};
exports.ForgotPasswordService = ForgotPasswordService;
exports.ForgotPasswordService = ForgotPasswordService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ForgotPasswordService);
//# sourceMappingURL=forgot-password.service.js.map