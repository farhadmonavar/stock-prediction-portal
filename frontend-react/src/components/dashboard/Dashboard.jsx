import {useEffect, useState} from 'react'
import axiosInstance from '../../axiosInstance'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faSpinner} from '@fortawesome/free-solid-svg-icons'

const Dashboard = () => {
    const [ticker, setTicker] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const [plot, setPlot] = useState()
    const [ma100, setMA100] = useState()
    const [ma200, setMA200] = useState()
    const [prediction, setPrediction] = useState()

    const [mse, setMSE] = useState()
    const [rmse, setRMSE] = useState()
    const [r2, setR2] = useState()

    const [predictedPrices, setPredictedPrices] = useState([])
    const [actualPrices, setActualPrices] = useState([])
    const [latestPrediction, setLatestPrediction] = useState()


    useEffect(() => {
        const fetchProtectedData = async () => {
            try {
                await axiosInstance.get('/protected-view/')
            } catch (error) {
                console.error('Error fetching data:', error)
            }
        }

        fetchProtectedData()
    }, [])


    const handleSubmit = async (e) => {
        e.preventDefault()

        setLoading(true)
        setError('')

        try {
            const response = await axiosInstance.post('/predict/', {
                ticker: ticker.toUpperCase()
            })

            console.log(response.data)


            // Check backend error
            if (response.data.error) {
                setError(response.data.error)
                return
            }


            const backendRoot = import.meta.env.VITE_BACKEND_ROOT


            // Images
            const plotUrl = `${backendRoot}${response.data.plot_img}`
            const ma100Url = `${backendRoot}${response.data.plot_100_dma}`
            const ma200Url = `${backendRoot}${response.data.plot_200_dma}`
            const predictionUrl = `${backendRoot}${response.data.plot_prediction}`


            setPlot(plotUrl)
            setMA100(ma100Url)
            setMA200(ma200Url)
            setPrediction(predictionUrl)


            // Model evaluation
            setMSE(response.data.mse)
            setRMSE(response.data.rmse)
            setR2(response.data.r2)


            // Numerical prediction data
            setPredictedPrices(response.data.predicted_prices)
            setActualPrices(response.data.actual_prices)


            // Last predicted price
            setLatestPrediction(
                response.data.predicted_prices[
                response.data.predicted_prices.length - 1
                    ]
            )


        } catch (error) {
            console.error(
                'There was an error making the API request:',
                error
            )

            setError('Something went wrong. Please try again.')

        } finally {
            setLoading(false)
        }
    }


    return (
        <div className='container'>
            <div className="row">

                <div className="col-md-6 mx-auto">

                    <form onSubmit={handleSubmit}>

                        <input
                            type="text"
                            className='form-control'
                            placeholder='Enter Stock Ticker'
                            value={ticker}
                            onChange={(e) => setTicker(e.target.value)}
                            required
                        />


                        {error &&
                            <small className="text-danger">
                                {error}
                            </small>
                        }


                        <button
                            type='submit'
                            className='btn btn-info mt-3'
                        >

                            {loading ?
                                (
                                    <span>
                                        <FontAwesomeIcon icon={faSpinner} spin/>
                                        {' '}Please wait...
                                    </span>
                                )
                                :
                                'See Prediction'
                            }

                        </button>

                    </form>

                </div>


                {prediction && (

                    <div className="prediction mt-5">


                        <div className="p-3">
                            {plot &&
                                <img
                                    src={plot}
                                    style={{maxWidth: '100%'}}
                                    alt="Stock Price"
                                />
                            }
                        </div>


                        <div className="p-3">
                            {ma100 &&
                                <img
                                    src={ma100}
                                    style={{maxWidth: '100%'}}
                                    alt="100 DMA"
                                />
                            }
                        </div>


                        <div className="p-3">
                            {ma200 &&
                                <img
                                    src={ma200}
                                    style={{maxWidth: '100%'}}
                                    alt="200 DMA"
                                />
                            }
                        </div>


                        <div className="p-3">
                            {prediction &&
                                <img
                                    src={prediction}
                                    style={{maxWidth: '100%'}}
                                    alt="Prediction"
                                />
                            }
                        </div>


                        <div className="text-light p-3">

                            <h4>
                                Model Evaluation
                            </h4>


                            <p>
                                Mean Squared Error (MSE):
                                {' '}
                                {mse}
                            </p>


                            <p>
                                Root Mean Squared Error (RMSE):
                                {' '}
                                {rmse}
                            </p>


                            <p>
                                R-Squared:
                                {' '}
                                {r2}
                            </p>

                        </div>


                        <div className="text-light p-3">

                            <h4>
                                Prediction Result
                            </h4>


                            {latestPrediction &&
                                <p>
                                    Latest Predicted Price:
                                    {' '}
                                    ${latestPrediction.toFixed(2)}
                                </p>
                            }


                            {actualPrices.length > 0 &&
                                <p>
                                    Last Actual Price:
                                    {' '}
                                    $
                                    {actualPrices[
                                    actualPrices.length - 1
                                        ].toFixed(2)}
                                </p>
                            }

                        </div>


                        <div className="text-light p-3">

                            <h4>
                                Prediction Samples
                            </h4>


                            {predictedPrices.length > 0 && (

                                <table className="table table-dark">

                                    <thead>
                                    <tr>
                                        <th>Day</th>
                                        <th>Actual</th>
                                        <th>Predicted</th>
                                    </tr>
                                    </thead>


                                    <tbody>

                                    {predictedPrices
                                        .slice(0, 10)
                                        .map((price, index) => (

                                            <tr key={index}>

                                                <td>
                                                    {index + 1}
                                                </td>

                                                <td>
                                                    $
                                                    {actualPrices[index]
                                                        ?.toFixed(2)}
                                                </td>

                                                <td>
                                                    $
                                                    {price.toFixed(2)}
                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            )}

                        </div>


                    </div>

                )}

            </div>
        </div>
    )
}


export default Dashboard