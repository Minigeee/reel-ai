-- Seed data for testing and development

-- Insert test users
INSERT INTO auth.users (id, email)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'user1@example.com'),
    ('22222222-2222-2222-2222-222222222222', 'user2@example.com'),
    ('33333333-3333-3333-3333-333333333333', 'user3@example.com');

-- Insert user profiles
INSERT INTO public.users (id, username, email, display_name, avatar_url, bio)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'creator1', 'user1@example.com', 'Creative Creator', 'https://i.pravatar.cc/150?u=1', 'Making awesome videos!'),
    ('22222222-2222-2222-2222-222222222222', 'videostar', 'user2@example.com', 'Video Star', 'https://i.pravatar.cc/150?u=2', 'Video enthusiast'),
    ('33333333-3333-3333-3333-333333333333', 'contentpro', 'user3@example.com', 'Content Pro', 'https://i.pravatar.cc/150?u=3', 'Professional content creator');

-- Insert sample videos
INSERT INTO public.videos (
    id, user_id, title, description, duration, video_url, thumbnail_url,
    category, tags, status, published_at
)
VALUES
    (
        '11111111-1111-1111-1111-111111111112',
        '11111111-1111-1111-1111-111111111111',
        'My First AI Video',
        'Check out this amazing AI-generated video!',
        120,
        'https://example.com/videos/first-video.mp4',
        'https://example.com/thumbnails/first-video.jpg',
        'Tutorial',
        ARRAY['ai', 'tutorial'],
        'published',
        NOW() - INTERVAL '2 days'
    ),
    (
        '22222222-2222-2222-2222-222222222223',
        '22222222-2222-2222-2222-222222222222',
        'Creative Editing Tips',
        'Learn some amazing video editing tips!',
        180,
        'https://example.com/videos/editing-tips.mp4',
        'https://example.com/thumbnails/editing-tips.jpg',
        'Education',
        ARRAY['editing', 'tips'],
        'published',
        NOW() - INTERVAL '1 day'
    ),
    (
        '33333333-3333-3333-3333-333333333334',
        '33333333-3333-3333-3333-333333333333',
        'Draft Video',
        'This is still being worked on',
        90,
        'https://example.com/videos/draft.mp4',
        'https://example.com/thumbnails/draft.jpg',
        'Personal',
        ARRAY['draft'],
        'draft',
        NULL
    );

-- Insert comments
INSERT INTO public.comments (
    id, video_id, user_id, content
)
VALUES
    (
        '11111111-1111-1111-1111-111111111113',
        '11111111-1111-1111-1111-111111111112',
        '22222222-2222-2222-2222-222222222222',
        'Great video! Very helpful.'
    ),
    (
        '22222222-2222-2222-2222-222222222224',
        '22222222-2222-2222-2222-222222222223',
        '33333333-3333-3333-3333-333333333333',
        'Thanks for sharing these tips!'
    );

-- Insert video likes
INSERT INTO public.video_likes (video_id, user_id)
VALUES
    ('11111111-1111-1111-1111-111111111112', '22222222-2222-2222-2222-222222222222'),
    ('11111111-1111-1111-1111-111111111112', '33333333-3333-3333-3333-333333333333'),
    ('22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111');

-- Insert follows
INSERT INTO public.follows (follower_id, following_id)
VALUES
    ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111'),
    ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111'),
    ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');

-- Update video metrics (these would normally be handled by triggers, but we'll set initial values)
UPDATE public.videos
SET 
    like_count = (
        SELECT COUNT(*) 
        FROM public.video_likes 
        WHERE video_likes.video_id = videos.id
    ),
    comment_count = (
        SELECT COUNT(*) 
        FROM public.comments 
        WHERE comments.video_id = videos.id
    );
