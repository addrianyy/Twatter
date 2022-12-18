import { Box, IconButton, Typography, Stack } from "@mui/material";

import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import RepeatIcon from '@mui/icons-material/Repeat';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PublishIcon from '@mui/icons-material/Publish';

import { useRouter } from "next/router";

import { MouseEvent } from 'react';
import { PostContent, ProfileAvatar } from "./Misc";
import { Post, Profile } from "@prisma/client";
import { trpc } from "utils/trpc";
import { useSession } from "next-auth/react";

const getHour = (date: Date) => {
    let text = date.toLocaleString();
    return text.substring(text.length - 8, text.length - 3);
}

const getDate = (date: Date) => {
    let text = date.toLocaleString();
    return text.substring(0, text.length - 10);
}

const Post = ({ 
    data,
    parentOwner,
}: { 
    data: Post & {
        owner: Profile,
        _count: {
            comments: number,
        }
    },
    parentOwner?: Profile,
}) => {
    const router = useRouter();
    const { data: sessionData } = useSession();
    const { id, content, likes, retweets, createdAt, owner, parentPostID } = data;

    const handleOpenProfile = (e: MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        router.push(`/profile/${owner.username}`);
    }

    const handleOpenParentProfile = (e: MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        parentOwner && router.push(`/profile/${parentOwner.username}`);
    }

    const handleOpenPost = () => {
        router.push(`/post/${data.id}`)
    }

    const queryUtils = trpc.useContext();
    const { comments } = data._count;
    const { data: savedPostData } = trpc.savedPost.getByPost.useQuery(id);
    const { mutate: savedPostsMutate } = trpc.savedPost.set.useMutation();

    const handleSavePost = (e: MouseEvent<HTMLElement> ,type: "like" | "retweet") => {
        e.stopPropagation();
        // could do it on server
        if (sessionData?.user.profileID === owner.id) return;
        savedPostsMutate({
            postID: id,
            like: (type === "like")? !savedPostData?.like : undefined,
            retweet: (type === "retweet")? !savedPostData?.retweet : undefined,
        }, { onSuccess: () => {
            queryUtils.post.invalidate();
            queryUtils.savedPost.invalidate();
        }})
    }

    const handleOpenOptions = (e: MouseEvent<HTMLElement>) => {
        e.stopPropagation();
    }

    return (
        <Box 
            pl={2} pr={2} 
            onClick={handleOpenPost}
            sx={{ 
                border: "1px grey solid", 
                borderTop: "none", 
                cursor: "pointer" 
            }}
        >
            <Stack direction="column">
                <Stack direction="row">
                    <ProfileAvatar 
                        image={owner.image}
                        linePos={(parentPostID && "top") || undefined}
                        handleOpenProfile={handleOpenProfile}
                    />

                    <Stack direction="column" mt="auto">
                        <Typography> {owner.displayName} </Typography>
                        <Typography color="text.dark" onClick={handleOpenProfile}>
                            {"@" + owner.username}
                        </Typography>
                    </Stack>

                    <IconButton sx={{ m: "auto", mr: 0 }}>
                        <MoreHorizIcon fontSize="small" />
                    </IconButton>
                </Stack>

                {parentOwner &&
                    <Stack direction="row" marginTop={1}>
                        <Typography color="text.dark"> Replying to </Typography>
                        <Typography color="text.dark" ml={1} onClick={handleOpenProfile}>
                            {"@" + parentOwner?.username}
                        </Typography>
                    </Stack>
                }

                <PostContent raw={content} isThread onOpen={url => router.push(url)} />

                {/* <Typography mt={1} whiteSpace="pre-line">
                    {content}
                </Typography>

                {image ?
                    <Box pr={2} mt={2}>
                        <img
                            src={`${image}`}
                            title="image"
                            style={{ maxWidth: "100%", borderRadius: 20, border: "1px solid grey" }}
                            loading="lazy"
                        />
                    </Box>
                    : null
                } */}

                <Typography color="text.dark" mt={2} mb={2}> {getHour(createdAt)} · {getDate(createdAt)} </Typography>

                <Stack direction="row" spacing={3} pt={2} pb={2} borderTop="1px solid grey" borderBottom="1px solid grey">
                    <Typography>{retweets} Retweets</Typography>
                    <Typography>{5} Quote Tweets</Typography>
                    <Typography>{likes} Likes</Typography>
                </Stack>

                <Stack direction="row" spacing="auto" pt={2} pb={2} pl={4} pr={4}>
                    <IconButton>
                        <ChatBubbleIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                        color={savedPostData?.retweet && "success" || "default"}
                        onClick={(e: MouseEvent<HTMLElement>) => handleSavePost(e, "retweet")}
                    >
                        <RepeatIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                        color={savedPostData?.like && "error" || "default"}
                        onClick={(e: MouseEvent<HTMLElement>) => handleSavePost(e, "like")} 
                    >
                        <FavoriteIcon fontSize="small" />
                    </IconButton>
                    <IconButton>
                        <PublishIcon fontSize="small" />
                    </IconButton>
                </Stack>

            </Stack>
        </Box>
    )
}
export default Post;