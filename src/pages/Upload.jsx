import React, { useEffect, useState } from 'react';
import Header from '../components/Common/Header/Header';
import styled from 'styled-components';
import { ProfileImage42 } from '../components/Common/ProfileImage';
import { UploadButton } from '../components/Common/Button/ImageButton';
import { POST_API } from '../api/CommonAPI';
import { useNavigate } from 'react-router-dom';
import iconClose from '../assets/image/icon-close.svg';
import imageCompression from 'browser-image-compression';
import { Helmet } from 'react-helmet-async';
import useModal from '../hooks/useModal';
import useAuth from '../hooks/useAuth';

const USection = styled.section`
  padding: 70px 20px;
  position: relative;

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
    border: 1px solid var(--color-bg);
    border-radius: 20px;
  }

  .delete-button {
    position: absolute;
    top: 10px;
    right: 10px;
  }

  @media screen and (min-width: 768px) {
    margin-left: 60px;
  }

  @media screen and (min-width: 1247px) {
    margin-left: 200px;
  }
`;

const StyledUploadButton = styled(UploadButton)`
  position: fixed;
  bottom: 90px;
  right: 30px;
  @media screen and (min-width: 768px) {
    bottom: 30px;
  }
`;

export default function Upload() {
  const { userimage } = useAuth();
  // 요청에 사용하는 url
  const url = '/post';

  //useState들
  // 업로드할 게시물 텍스트
  const [text, setText] = useState('');
  // 업로드할 게시물 이미지 한개
  const [image, setImage] = useState(null);
  //업로드할 게시물 이미지 여러개
  const [images, setImages] = useState([]);
  //업로드할 게시물 이미지 서버주소
  const [imageUrl, setImageUrl] = useState('');
  const [isReady, setIsReady] = useState(false);

  const { functionModal } = useModal();
  const navigate = useNavigate();

  useEffect(() => {
    if (text === '' && images.length === 0) {
      setIsReady(true);
    } else {
      setIsReady(false);
    }
  }, [text, images]);

  //게시글 내용
  // textarea가 바뀌면 내용을 가져와서 setText()로 text에 넣어줌
  const postContent = (e) => {
    setText(e.target.value);
  };
  // postContent 끝

  const imageDelete = (e) => {
    // 누른 버튼의 아이디값(키와 동일)을 가져옴
    const deleteImage = e.currentTarget.getAttribute('id');

    // 선택한 키값의 이미지가 없는 새로운 배열 만들기
    const modify = images.filter((image) => image !== deleteImage);

    // setImages로 새로운 이미지 넣기
    setImages(modify);
  };
  // imageDelete 끝

  // 게시글 내용을 서버에 업로드 하는 함수
  const handleSubmit = async () => {
    const uploadPost = async () => {
      const bodyData = {
        'post': {
          'content': text,
          'image': imageUrl,
        },
      };
      const data = await POST_API(url, bodyData);
      navigate(`/post/${data.post.id}`);
    };
    functionModal(
      '게시물을 업로드하시겠습니까?',
      '업로드',
      '업로드되었습니다',
      '확인',
      uploadPost,
    );
  };
  // handleSubmit 끝

  // +
  // 이미지를 압축
  // browser-image-compression 라이브러리 사용
  // npm install browser-image-compression --save
  const getResizeImg = async (image) => {
    // 업로드 버튼을 눌렀을 때 아무것도 선택하지 않고 취소한 경우
    // 라이브러리에서 처리해줘야 하는거 아님?
    if (image === undefined) {
      alert('이미지 선택을 취소하셨습니다!');
      return;
    }
    // 받은 이미지를 압축 후 blob 형식으로 반환
    const resizeBlob = await imageCompression(image, { maxSizeMB: 0.1 });
    //blob을 업로드 가능한 형태인 file로 변환
    const resizeFile = new File([resizeBlob], image.name, {
      type: image.type,
    });
    return resizeFile;
  };

  // 이미지 여러개를 하나씩 선택해서 올림 (업로드 버튼 클릭 여러번)
  const imageUpload = async (e) => {
    //input이 변경되면 변경된 요소를 가져온다
    const imageFile = e.target.files[0];

    // 이미지를 압축하기 위해 리사이징 함수 호출
    const resizeFile = await getResizeImg(imageFile);

    // 사진 갯수 제한
    if (images.length > 2) {
      alert('사진은 3장까지만 가능합니다');
      return;
    }

    //폼데이터를 만들고 내 데이터를 추가
    const formData = new FormData();
    // formData.append('image', imageFile);
    formData.append('image', resizeFile);

    //요청
    const res = await fetch(
      `${process.env.REACT_APP_API_HOST}/image/uploadfiles`,
      {
        method: 'POST',
        body: formData,
      },
    );
    // 데이터를 json으로 받아오기
    const json = await res.json();

    const fileUrl = json.map((img) => {
      return `${process.env.REACT_APP_API_HOST}/` + img.filename;
    });

    setImages([...images, ...fileUrl]);
  };
  // imageUpload 끝

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
      <Header upload onUploadClick={handleSubmit} disabled={isReady} />
      <USection>
        <h1 className='a11y-hidden'>게시글 작성 페이지</h1>
        <section className='form-wrapper'>
          <ProfileImage42 image={userimage} />
          <form>
            <textarea
              className='text-area'
              placeholder='게시글 입력하기...'
              // rows={1}
              onKeyDown={autoResizeTextarea}
              onKeyUp={autoResizeTextarea}
              onChange={postContent}
            ></textarea>
            {/* {images.length < 3 && <StyledUploadButton func={imageUpload} />} */}
            {images.length === 3 ? (
              <StyledUploadButton isDisable />
            ) : (
              <StyledUploadButton func={imageUpload} />
            )}
          </form>
        </section>
        <section className='upload-images-wrapper'>
          {/* image가 null이면 렌더링 되지 않게 */}
          {images &&
            images.map((image) => {
              return (
                <article className='image-wrapper' key={image}>
                  <button
                    className='delete-button'
                    id={image}
                    onClick={imageDelete}
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
