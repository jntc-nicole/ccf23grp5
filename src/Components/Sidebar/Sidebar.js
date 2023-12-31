import './Sidebar.css';

function Sidebar(props) {
  var grps = props.grps.map((grp) => {
    return (
      <input className="grpitm" type="button" value={grp} onClick={() => {props.changegrp(grp)}} />
    );
  })
  return (
    <div className='sidebar'>
      <div className='overflow'>
        {grps}
      </div>
      <div>
        <h6>New Group:</h6>
        <input type='text' id="newgrpname" />
        <br></br>
        <input type="button" value="Add group" onClick={
          () => {
            const newgrp = document.getElementById("newgrpname").value;
            props.addgrp(newgrp);
          }
        } />
      </div>
    </div>
  );
}

export default Sidebar;