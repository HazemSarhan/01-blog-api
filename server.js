import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
const app = express();

// Rest of packages
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';

// Middlwares
import notFoundMiddleware from './middleware/not-found.js';
import errorHandlerMiddleware from './middleware/error-handler.js';

// SwaggerUI Docs
import swaggerUI from 'swagger-ui-express';
import yaml from 'yamljs';
const swaggerDocument = yaml.load('./swagger.yaml');

// Routes
import authRoutes from './routes/auth.routes.js';
import blogRoutes from './routes/blogs.routes.js';
import reactionRoutes from './routes/reaction.routes.js';
import commentRoutes from './routes/comment.routes.js';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}
app.use(cookieParser(process.env.JWT_SECRET));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp',
  }),
);

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/blogs', blogRoutes);
app.use('/api/v1/reactions', reactionRoutes);
app.use('/api/v1/comments', commentRoutes);

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.get('/', (req, res) => {
  res.send(
    '<h1>Blog API</h1><p>Documentation <a href="/api-docs">here</a></p>',
  );
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
};

startServer();
