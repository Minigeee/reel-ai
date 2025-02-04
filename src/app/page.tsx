'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { VideoPlayer } from '@/components/video/video-player';
import { useVideos } from '@/lib/queries/use-videos';
import assert from 'assert';
import { useEffect, useState } from 'react';

export default function FeedPage() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useVideos();
  const [api, setApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState<number>(0);

  console.log(data);

  // Handle carousel scroll to end and update active slide index
  useEffect(() => {
    if (!api) return;

    function handleSelect() {
      assert(api);
      
      const currentIndex = api.selectedScrollSnap();
      setActiveIndex(currentIndex);
      const lastSlideIndex = (data?.pages.flat().length ?? 0) - 1;
      if (
        currentIndex === lastSlideIndex &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    }

    api.on('select', handleSelect);
    return () => {
      api.off('select', handleSelect);
    };
  }, [api, data?.pages, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allVideos = data?.pages.flat() ?? [];

  return (
    <div className="relative h-full w-full">
      <Carousel
        orientation="vertical"
        className="h-full"
        opts={{
          axis: 'y',
          dragFree: false,
          containScroll: 'trimSnaps',
        }}
        setApi={setApi}
      >
        <CarouselContent className="h-[calc(100dvh-3rem)]">
          {allVideos.map((video, index) => (
            <CarouselItem key={video.id} className="pt-0">
              <VideoPlayer video={video} isActive={index === activeIndex} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      
      {isFetchingNextPage && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-center p-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-white" />
        </div>
      )}
    </div>
  );
}
