console.log('USERNAME:', process.env.DATABASE_USERNAME);
console.log('PASSWORD:', process.env.DATABASE_PASSWORD);

const configuration = () => ({
  DATABASE: {
    HOST: process.env.DATABASE_HOST,
    PORT: parseInt(process.env.DATABASE_PORT || '3306'),
    USERNAME: process.env.DATABASE_USERNAME,
    PASSWORD: process.env.DATABASE_PASSWORD,
    NAME: process.env.DATABASE_NAME,
  },

  JWT: {
    ACCESS_TOKEN: {
      SECRET: process.env.ACCESS_SECRET,
      EXPIRY: process.env.ACCESS_EXPIRY_TIME,
    },
    REFRESH_TOKEN: {
      SECRET: process.env.ACCESS_SECRET,
      EXPIRY: process.env.ACCESS_EXPIRY_TIME,
    },
  },
});

export default configuration;
