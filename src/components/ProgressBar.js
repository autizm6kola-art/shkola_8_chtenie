import '../styles/progressBar.css';


const ProgressBar = ({correct, total}) => {
  const percent = total === 0 ? 0 : (correct / total) * 100;
  
  
  const containerStyle = {
    width: "100%",
    height: '20px',
    backgroundColor: '#ddd',
    borderRadius: '10px',
    overflow: 'hidden',
  };

  const fillerStyle = {
    width: `${percent}%`,
    height: '100%',
    backgroundColor: 'green',
  }
  
  return ( 
  
    <div style={containerStyle}>
      <div style={fillerStyle}></div>
    </div>
   );
}
 
export default ProgressBar;