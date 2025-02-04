import { VideoCreator } from '@/components/create/video-creator';

export default function CreatePage() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold px-6 text-center">Create New Video</h1>
      <VideoCreator />
    </div>
  );
}
