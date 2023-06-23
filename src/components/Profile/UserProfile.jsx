import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import CommonProfile from './CommonProfile';
import CardList from '../List/CardList';
import MButton from '../Common/Button/MButton';
import IconShareBtn from '../../assets/image/icon-share-btn.svg';
import IconMessageBtn from '../../assets/image/icon-message-btn.svg';
import { getLikedGameAPI } from '../../api/GameAPI/LikeGameAPI';
import { useRecoilState } from 'recoil';
import { userToken } from '../../atom/loginAtom';
import { getPost } from '../../api/PostAPI.js/GetPostAPI';
import PostList from '../Post/PostList';
import { followAPI, unfollowAPI } from '../../api/FollowAPI';

const LikedGameStyle = styled.section`
  background: white;
  border-top: 1px solid var(--color-maingrey);
  border-bottom: 1px solid var(--color-maingrey);
  h2 {
    padding: 20px 20px 0;
  }
  ul {
    overflow-x: scroll;
  }
`;
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  background-color: var(--color-bg);
`;

function UserProfile({ profile }) {
  const { id } = useParams();
  const [token, setToken] = useRecoilState(userToken);
  const navigate = useNavigate();
  const [likedGame, setLikedGame] = useState([]);
  const [postData, setPostData] = useState([]);
  const [state, setState] = useState(false);
  const [isFollow, setIsFollow] = useState(profile.isfollow);
  const [numFollower, setNumFollower] = useState(profile.followerCount);

  const handleState = async () => {
    console.log('눌림!');
    if (isFollow) {
      const data = await unfollowAPI(token, id);
      console.log(data);
      setIsFollow(data.profile.isfollow);
      setNumFollower(data.profile.followerCount);
    } else {
      const data = await followAPI(token, id);
      console.log(data);
      setIsFollow(data.profile.isfollow);
      setNumFollower(data.profile.followerCount);
    }
  };
  console.log(isFollow);

  useEffect(() => {
    const getLikedGameData = async () => {
      const data = await getLikedGameAPI(token);
      setLikedGame(data);
    };
    const getPostData = async () => {
      const data = await getPost(token, id);
      setPostData(data.post);
    };
    getLikedGameData();
    getPostData();
  }, []);
  console.log(postData);
  return (
    <Container>
      <CommonProfile profile={profile} numFollower={numFollower}>
        <button type='button'>
          <img src={IconShareBtn} alt='공유' />
        </button>
        <MButton
          text={isFollow ? '언팔로우' : '팔로우'}
          func={handleState}
          active={isFollow}
        />
        <button
          type='button'
          onClick={() => {
            navigate(`/chat/${id}`);
          }}
        >
          <img src={IconMessageBtn} alt='공유' />
        </button>
      </CommonProfile>
      <LikedGameStyle className='section-game'>
        <h2>직관 일정</h2>
        <CardList games={likedGame} />
      </LikedGameStyle>

      <PostList post={postData} onlyGame={false} />
    </Container>
  );
}

function MyProfile({ profile }) {
  const navigate = useNavigate();
  const [likedGame, setLikedGame] = useState([]);
  const [numFollower, setNumFollower] = useState(profile.followerCount);
  const [token, setToken] = useRecoilState(userToken);

  useEffect(() => {
    const getLikedGameData = async () => {
      const data = await getLikedGameAPI(token);
      setLikedGame(data);
    };
    getLikedGameData();
  }, []);
  return (
    <Container>
      <CommonProfile profile={profile} numFollower={numFollower}>
        <MButton
          text='프로필 수정'
          func={() => {
            navigate('/edit');
          }}
          active
        />
        <MButton
          text='일정 추가'
          func={() => {
            navigate('/addgame');
          }}
          active
        />
      </CommonProfile>

      <LikedGameStyle className='section-game'>
        <h2>직관 일정</h2>
        <CardList games={likedGame} />
      </LikedGameStyle>
    </Container>
  );
}

export { UserProfile, MyProfile };
