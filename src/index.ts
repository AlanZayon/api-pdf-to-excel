// src/index.ts
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import morgan from 'morgan';
import uploadRoutes from './infrastructure/routes/uploadRoutes';
import downloadRoutes from './infrastructure/routes/downloadRoutes';
import path from 'path';
import './telemetry';

const app = express();
app.use(helmet());
app.use(compression());
const allowedOrigins = [
  'http://localhost:5173',
  'https://front-pdf-to-excel.vercel.app',
  'https://admin.meusite.com',
];

const corsOptions: cors.CorsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.use(morgan('dev'));

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/teste', (req, res) => {
  console.log("Você acessou /teste");
  res.send("ok");
});

app.use('/api', uploadRoutes);
app.use('/api', downloadRoutes); 
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
