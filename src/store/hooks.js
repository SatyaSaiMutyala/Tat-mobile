import {useDispatch, useSelector} from 'react-redux';

/** Screens use these instead of importing react-redux directly. */
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;
