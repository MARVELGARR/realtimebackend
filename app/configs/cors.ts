const corsOptions = {
    origin: [`${process.env.FRONTEND_URL}`, "http://localhost:3001"],  // Your frontend URL and localhost
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
};

export default corsOptions;
  