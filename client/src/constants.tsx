import { makeStyles } from "@material-ui/core/styles";

export const headerDataLaenaja = {
  name: 'Pealkiri',
  author: 'Autor',
  quantity: 'Koguseid alles',
  handedOver: 'Antud üle',
  returnedBack: 'Tagasi toodud',
  cancelBooking: 'Tühista broneering',
  remove: 'Eemalda',
  changeQuantity: 'Muuda kogust',
  borrowing_weeks: 'Laenutuse aeg (nädalat)',
  changeBorrowingTime: 'Muuda laenutamise aega'
};

export const headerDataLaenutaja = {
  name: 'Pealkiri',
  author: 'Autor',
  booked: 'Broneeri',
  received: 'Kätte saadud',
  returned: 'Tagastatud',
  cancelBooking: 'Tühista broneering'
};

export const useStyles = makeStyles({
  custom: {
    color: 'black',
    fontSize: '100'
  }
});

export const avatarImage = 'https://media.istockphoto.com/vectors/user-icon-flat-isolated-on-white-background-user-symbol-vector-vector-id1300845620?k=20&m=1300845620&s=612x612&w=0&h=f4XTZDAv7NPuZbG0habSpU0sNgECM0X7nbKzTUta3n8=';