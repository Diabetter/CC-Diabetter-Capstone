import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { getUserByGoogleId, getUserById, createUserWithGoogleId } from "./helpers/database.js";

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await getUserByGoogleId(profile.id);
        if (!user) {
            user = await createUserWithGoogleId({
                googleId: profile.id,
                email: profile.emails[0].value,
                name: profile.displayName,
                password: 'byGoogleId',
            });
        }
        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await getUserById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

export default passport;