import React from 'react';
import GlobalStyles from './style/GlobalStyles';
import Router from './routes/Router';
import BottomSheet from './components/CommonBottomSheet';
import Modal from './components/CommonModal';
import styled from 'styled-components';
import { useRecoilState } from 'recoil';
import { isBottomSheetOpen } from './atom/bottomSheetAtom';
import { isModalOpen } from './atom/modalAtom';

const ContainerStyle = styled.div`
  width: 390px;
  margin: auto;
  height: 820px;
`;

function App() {
  const [isBsOpen, setIsBsOpen] = useRecoilState(isBottomSheetOpen);
  const [isModal, setIsModal] = useRecoilState(isModalOpen);
  return (
    <ContainerStyle>
      <GlobalStyles />
      <Router />
      {isBsOpen && <BottomSheet />}
      {isModal && <Modal />}
    </ContainerStyle>
  );
}

export default App;
