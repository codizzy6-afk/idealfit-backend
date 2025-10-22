export default function handler(req, res) {
  res.status(200).json({
    message: 'Hello World from IdealFit!',
    status: 'working',
    timestamp: new Date().toISOString()
  });
}
