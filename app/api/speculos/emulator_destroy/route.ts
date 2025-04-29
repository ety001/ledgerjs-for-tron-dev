import cleanSpeculos from '@/lib/cleanSpeculos';

export async function GET() {
  const inss = cleanSpeculos();
  console.log("All speculos instances have been cleaned up.", inss);
  return Response.json({
    'status': 'success',
    'instances': inss,
  });
}