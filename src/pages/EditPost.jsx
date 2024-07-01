import React, { useEffect, useRef, useState } from 'react';
import Header from '../components/Common/Header/Header';
import styled from 'styled-components';
import { ProfileImage42 } from '../components/Common/ProfileImage';
import { UploadButton } from '../components/Common/Button/ImageButton';
import { GET_API, PUT_API } from '../api/CommonAPI';
import { useLocation, useNavigate } from 'react-router-dom';
import iconClose from '../assets/image/icon-close.svg';
import { Helmet } from 'react-helmet-async';
import useModal from '../hooks/useModal';
import useAuth from '../hooks/useAuth';

const USection = styled.section`
  padding: 70px 20px;

  .form-wrapper {
    width: 100%;
    display: flex;
    gap: 10px;
  }

  form {
    position: relative;
    width: calc(100% - 52px);
  }

  textarea {
    width: 100%;
    padding: 10px;
    border: none;
    resize: none;
    outline-color: var(--color-navy);
  }

  .upload-images-wrapper {
    margin-left: 60px;
    display: flex;
    gap: 20px;
    padding: 20px;
    overflow: scroll;
  }

  .image-wrapper {
    position: relative;
  }
  .upload-image {
    width: 150px;
    height: 150px;
    flex-shrink: 0;
    object-fit: cover;
  }

  .delete-button {
    position: absolute;
    top: 10px;
    right: 10px;
  }

  .upload-image {
    border: 1px solid var(--color-bg);
    border-radius: 20px;
  }
`;

const StyledUploadButton = styled(UploadButton)`
  position: fixed;
  bottom: 30px;
  right: 30px;
`;

export default function EditPost() {
  // 직접 받아올 때 사용
  const { userimage } = useAuth();
  const location = useLocation();
  const post_id = location.state.post_id;

  // 요청에 사용하는 url
  const url = '/post';

  //useState들
  const [post, setPost] = useState([]); // 받아온 게시물 데이터
  const [text, setText] = useState(''); // 업로드할 게시물 텍스트
  const [images, setImages] = useState([]); //업로드할 게시물 이미지 여러개
  const [imageUrl, setImageUrl] = useState(''); //업로드할 게시물 이미지 서버주소
  const [isReady, setIsReady] = useState(false);
  const { functionModal } = useModal();
  const navigate = useNavigate();

  // 이전 데이터 요청
  useEffect(() => {
    const prevPost = async (e) => {
      const res = await GET_API('/post/' + post_id);
      setPost(res);
    };
    prevPost();
    autoResizeTextarea();
  }, []);

  useEffect(() => {
    if (text === '' && images[0] === '') {
      setIsReady(true);
    } else {
      setIsReady(false);
    }
  }, [text, images]);

  // post값이 바뀌면 post길이가 0보다 큰지 확인해서 값을 바꿔준다.
  useEffect(() => {
    console.log('use effect 실행 post 바뀜');
    // 첫 렌더링시 빈 배열[] 예외처리
    if (post.length !== 0) {
      // 불러온 이미지리스트 분리해서 넣어준다
      if (post.post.image.length > 0) {
        const previurl = post.post.image.split(',');
        if (previurl[0] !== '') {
          setImages(previurl);
        }
      }

      // 불러온 게시물 글 넣기
      document.querySelector('.text-area').value = post.post.content;
      setText(post.post.content);
    }
  }, [post]);

  //게시글 내용
  // textarea가 바뀌면 내용을 가져와서 setText()로 text에 넣어줌
  const postContent = (e) => {
    console.log('내용 바뀜');
    setText(e.target.value);
  };
  // postContent 끝

  // 이미지를 삭제하는 함수
  const imageDeleteModify = (e) => {
    console.log('이미지 삭제');

    // 누른 버튼의 아이디값(키와 동일)을 가져옴
    const deleteImage = e.currentTarget.getAttribute('id');

    // 선택한 키값의 이미지가 없는 새로운 배열 만들기
    const modify = images.filter((image) => image !== deleteImage);
    console.log(modify);

    // setImages로 새로운 이미지 넣기
    setImages(modify);
  };
  // imageDeleteModify 끝

  // 게시글 내용을 서버에 업로드 하는 함수
  const handleSubmitModify = async () => {
    const editPost = async () => {
      const bodyData = {
        'post': {
          'content': text,
          'image': imageUrl,
        },
      };
      const data = await PUT_API('/post/' + post_id, bodyData);
      navigate('/post/' + post_id);
    };
    functionModal(
      '게시물을 수정하시겠습니까?',
      '수정',
      '게시물이 수정되었습니다',
      '확인',
      editPost,
    );
  };
  // handleSubmitModify 끝

  // 이미지 여러개를 하나씩 선택해서 올림 (업로드 버튼 클릭 여러번)
  const imageUploadModify = async (e) => {
    console.log('이미지 변경');
    //input이 변경되면 변경된 요소를 가져온다
    const imageFile = e.target.files[0];

    // 사진 갯수 제한
    if (images.length > 2) {
      alert('사진은 3장까지만 가능합니다');
      return;
    }

    //폼데이터를 만들고 내 데이터를 추가
    const formData = new FormData();
    formData.append('image', imageFile);
    console.log(formData);

    //요청
    const res = await fetch(
      `${process.env.REACT_APP_API_HOST}/image/uploadfiles`,
      {
        method: 'POST',
        body: formData,
      },
    );

    // //데이터를 json으로 받아오기
    const json = await res.json();
    console.log(json);

    const fileUrl = json.map((img) => {
      return `${process.env.REACT_APP_API_HOST}/` + img.filename;
    });

    setImages([...images, ...fileUrl]);

    console.log(images);
  };
  // imageUploadModify 끝

  // 이미지 전송을 위해 이미지 주소 이어 붙이기
  const iurl = images.join(',');

  // iurl이 바뀔때만 setImageUrl로 imageUrl 변경
  useEffect(() => {
    setImageUrl(iurl);
  }, [iurl]);

  // textarea의 길이를 들어오는 게시글에 따라서 조정되게 하는 함수
  const autoResizeTextarea = () => {
    let textarea = document.querySelector('.text-area');

    if (textarea) {
      textarea.style.height = 'auto';
      let height = textarea.scrollHeight; // 높이
      textarea.style.height = `${height + 8}px`;
    }
  };
  // autoResizeTextarea 끝

  //렌더링
  return (
    <>
      <Helmet>
        <title>게시글 작성 • Spport</title>
      </Helmet>
      <Header upload onUploadClick={handleSubmitModify} disabled={isReady} />
      <USection>
        <section className='form-wrapper'>
          <ProfileImage42 image={userimage} />
          <form>
            <textarea
              className='text-area'
              placeholder='게시글 입력하기...'
              onKeyDown={autoResizeTextarea}
              onKeyUp={autoResizeTextarea}
              onChange={postContent}
            ></textarea>
            <StyledUploadButton func={imageUploadModify} />
          </form>
        </section>
        <section className='upload-images-wrapper'>
          {images.length !== 0 &&
            images.map((image) => {
              return (
                <article className='image-wrapper' key={image}>
                  <button
                    className='delete-button'
                    id={image}
                    onClick={imageDeleteModify}
                  >
                    <img src={iconClose} alt='이미지 삭제' />
                  </button>
                  <img className='upload-image' width={'100%'} src={image} />
                </article>
              );
            })}
        </section>
      </USection>
    </>
  );
}
