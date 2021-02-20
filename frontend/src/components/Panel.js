

const Panel = ({messages}) => {
    return (
        <div style={{height: '600px'}}>
         {
             messages.map(message => {
                 <p>{message.user} {message.message} {message.time}</p>
             })
         }
        </div>
    )
}
export default Panel