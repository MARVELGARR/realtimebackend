
const corsOptions = {
    origin: ["https://realtime-frontend-olive.vercel.app"],  // Your frontend URL and localhost
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
};

export default corsOptions;
  